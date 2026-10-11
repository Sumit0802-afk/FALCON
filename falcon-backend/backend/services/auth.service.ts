import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../database/prismaClient";
import { AppError } from "../utils/AppError";
import {
  AuthResult,
  LoginInput,
  OtpChallenge,
  RegisterInput,
  RegisterResult,
  ResetPasswordInput,
  toPublicUser,
  VerifyOtpInput,
} from "../models/user.model";
import { tokenService } from "./token.service";
import { emailService } from "./email.service";
import { otpService, OTP_EXPIRY_SECONDS, OTP_RESEND_COOLDOWN_SECONDS } from "./otp.service";

const SALT_ROUNDS = 12;
const DUMMY_HASH = "$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

function hashSecret(secret: string): string {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

/** Same error for an unknown email and a wrong password, so accounts can't be enumerated */
function invalidCredentialsError() {
  return new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/** Issues a login code for the user and emails it. The code never leaves this function except by email. */
async function dispatchLoginOtp(user: { id: string; email: string; name: string }): Promise<OtpChallenge> {
  const issued = await otpService.issue(user.id);

  try {
    await emailService.sendOtpEmail({
      to: user.email,
      name: user.name,
      otp: issued.otp,
      expiresInMinutes: OTP_EXPIRY_SECONDS / 60,
    });
  } catch {
    // email.service has already logged the (redacted) cause
    await otpService.discard(issued.id).catch(() => undefined);
    throw new AppError(
      "We couldn't send your verification code. Please try again in a moment.",
      502,
      "EMAIL_DELIVERY_FAILED"
    );
  }

  return {
    success: true,
    message: "OTP sent successfully",
    expiresInSeconds: OTP_EXPIRY_SECONDS,
    resendInSeconds: OTP_RESEND_COOLDOWN_SECONDS,
  };
}

export const authService = {
  /** Register a new user with secure password hash. The user then signs in with an emailed code. */
  async register(input: RegisterInput): Promise<RegisterResult> {
    const email = normalizeEmail(input.email);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw AppError.conflict("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    await prisma.user.create({
      data: {
        name: input.name.trim(),
        email,
        passwordHash,
      },
    });

    return { success: true, message: "Account created. Sign in to continue." };
  },

  /** Login, step 1: verify email & password, then email a one-time code. Also used to resend. */
  async login(input: LoginInput): Promise<OtpChallenge> {
    const user = await prisma.user.findUnique({
      where: { email: normalizeEmail(input.email) },
    });

    // Constant-time mitigation against user enumeration
    if (!user) {
      await bcrypt.compare(input.password, DUMMY_HASH);
      throw invalidCredentialsError();
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw invalidCredentialsError();
    }

    return dispatchLoginOtp(user);
  },

  /** Login, step 2: verify the 6-digit code and issue a session */
  async verifyOtp(
    input: VerifyOtpInput,
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuthResult> {
    const user = await prisma.user.findUnique({ where: { email: normalizeEmail(input.email) } });
    if (!user) {
      throw new AppError("Incorrect verification code. Please try again.", 401, "OTP_INVALID");
    }

    // Throws unless the code is correct; a correct code is consumed here
    await otpService.verify(user.id, input.otp.trim());

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        lastLogin: new Date(),
      },
    });

    // Create session in database
    // sessionId keeps tokens unique even when two sign-ins land in the same second
    const sessionToken = tokenService.sign({
      userId: updatedUser.id,
      role: updatedUser.role,
      sessionId: crypto.randomUUID(),
    });
    const sessionTokenHash = hashSecret(sessionToken);

    await prisma.session.create({
      data: {
        userId: updatedUser.id,
        sessionTokenHash,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      user: toPublicUser(updatedUser),
      token: sessionToken,
    };
  },

  /** Invalidate session on server-side */
  async logout(token?: string): Promise<void> {
    if (!token) return;

    try {
      const tokenHash = hashSecret(token);
      await prisma.session.updateMany({
        where: { sessionTokenHash: tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Best-effort logout cleanup
    }
  },

  /** Forgot password: send single-use reset token without revealing account existence */
  async forgotPassword(email: string, clientOrigin?: string): Promise<{ message: string }> {
    const genericResponse = {
      message: "If an account with that email address exists, password reset instructions have been sent.",
    };

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Constant-time mitigation
      await bcrypt.compare("dummy_pass", DUMMY_HASH);
      return genericResponse;
    }

    // Invalidate prior unused tokens
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashSecret(rawToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        used: false,
      },
    });

    const baseUrl = clientOrigin || process.env.CORS_ORIGIN?.split(",")[0] || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

    await emailService.sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
      expiresInMinutes: 15,
    });

    return genericResponse;
  },

  /** Reset password with single-use token */
  async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    const tokenHash = hashSecret(input.token.trim());

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.used || record.expiresAt < new Date()) {
      throw AppError.badRequest("Invalid or expired password reset link. Please request a new one.");
    }

    // Mark used immediately
    await prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { used: true },
    });

    // Hash new password
    const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

    // Update password
    await prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });

    // Revoke all existing sessions for this user
    await prisma.session.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return {
      message: "Your password has been successfully reset. Please sign in with your new credentials.",
    };
  },

  /** Get user by ID for /auth/me */
  async getById(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound("User not found");
    return toPublicUser(user);
  },

  /** Update the signed-in user's own profile */
  async updateProfile(userId: string, input: { name: string }) {
    const name = input.name.trim();
    if (!name) throw AppError.badRequest("Name is required");
    const user = await prisma.user.update({ where: { id: userId }, data: { name } });
    return toPublicUser(user);
  },

  /**
   * Change password for a signed-in user who knows the current one.
   * Every other session is revoked; the session making the request stays.
   */
  async changePassword(
    userId: string,
    input: { currentPassword: string; newPassword: string },
    currentToken?: string
  ): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.unauthorized("Authentication required");

    const matches = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!matches) {
      throw new AppError("Your current password is incorrect.", 400, "WRONG_PASSWORD");
    }
    if (input.currentPassword === input.newPassword) {
      throw AppError.badRequest("Choose a new password that is different from your current one.");
    }

    const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    await this.revokeOtherSessions(userId, currentToken);

    return { message: "Your password has been changed." };
  },

  /** Active sessions for the account, newest first. Token hashes never leave the server. */
  async listSessions(userId: string, currentToken?: string) {
    const currentHash = currentToken ? hashSecret(currentToken) : null;
    const sessions = await prisma.session.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return sessions.map((session) => ({
      id: session.id,
      current: session.sessionTokenHash === currentHash,
      userAgent: session.userAgent ? session.userAgent.slice(0, 300) : null,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
    }));
  },

  /** Sign out everywhere except the session making the request */
  async revokeOtherSessions(userId: string, currentToken?: string): Promise<{ revoked: number }> {
    const currentHash = currentToken ? hashSecret(currentToken) : null;
    const result = await prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(currentHash ? { sessionTokenHash: { not: currentHash } } : {}),
      },
      data: { revokedAt: new Date() },
    });
    return { revoked: result.count };
  },

  /** Validate active session in database */
  async validateSession(token: string): Promise<{ userId: string; role: string }> {
    const payload = tokenService.verify(token);
    const tokenHash = hashSecret(token);

    const session = await prisma.session.findUnique({
      where: { sessionTokenHash: tokenHash },
    });

    if (!session || session.revokedAt !== null || session.expiresAt < new Date()) {
      throw AppError.unauthorized("Session expired or revoked. Please sign in again.");
    }

    return { userId: payload.userId, role: payload.role };
  },
};
