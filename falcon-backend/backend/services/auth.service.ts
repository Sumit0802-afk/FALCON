import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../database/prismaClient";
import { AppError } from "../utils/AppError";
import {
  AuthResult,
  LoginInput,
  LoginMfaChallenge,
  RegisterInput,
  ResetPasswordInput,
  toPublicUser,
  VerifyOtpInput,
} from "../models/user.model";
import { tokenService } from "./token.service";
import { emailService } from "./email.service";

const SALT_ROUNDS = 12;
const DUMMY_HASH = "$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
const OTP_EXPIRY_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;

function hashSecret(secret: string): string {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

function safeCompareHashes(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const [local, domain] = parts;
  const maskedLocal =
    local.length <= 2 ? `${local[0]}*` : `${local[0]}${"*".repeat(Math.max(1, local.length - 2))}${local.slice(-1)}`;
  return `${maskedLocal}@${domain}`;
}

export const authService = {
  /** Register a new user with secure password hash */
  async register(input: RegisterInput): Promise<LoginMfaChallenge> {
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) {
      throw AppError.conflict("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email: input.email.toLowerCase().trim(),
        passwordHash,
      },
    });

    // Directly trigger OTP verification for new registration
    return this.initiateMfa(user.id, user.email, user.name);
  },

  /** Initiate MFA flow: creates cryptographically secure OTP and emails it */
  async initiateMfa(userId: string, email: string, name?: string): Promise<LoginMfaChallenge> {
    console.log(`[auth.service] OTP generation started for userId=${userId}`);

    // Invalidate existing unused login OTPs for this user
    await prisma.otpVerification.updateMany({
      where: {
        userId,
        purpose: "LOGIN_MFA",
        used: false,
      },
      data: { used: true },
    });

    // Generate cryptographically secure 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashSecret(rawOtp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.otpVerification.create({
      data: {
        userId,
        otpHash,
        purpose: "LOGIN_MFA",
        expiresAt,
        attempts: 0,
        maxAttempts: MAX_OTP_ATTEMPTS,
        used: false,
        lastResentAt: new Date(),
      },
    });

    console.log(`[auth.service] OTP persistence successful for userId=${userId}, expires=${expiresAt.toISOString()}`);

    // Send the OTP via email to user's real address
    console.log(`[auth.service] OTP email sending started for userId=${userId}`);
    try {
      await emailService.sendOtpEmail({
        to: email,
        name,
        otp: rawOtp,
        expiresInMinutes: OTP_EXPIRY_MINUTES,
      });
      console.log(`[auth.service] OTP email sent successfully for userId=${userId}`);
    } catch (err: any) {
      console.error(`[auth.service] OTP email delivery failed for userId=${userId}:`, err.message);
      if (process.env.NODE_ENV === "production") {
        throw AppError.internalError(
          `Unable to deliver verification code to ${maskEmail(email)}: ${err.message}`
        );
      }
      console.warn(`[auth.service] Dev mode: continuing to verification view despite email error.`);
    }

    const mfaToken = tokenService.signMfa(userId, email);

    return {
      mfaRequired: true,
      mfaToken,
      email: maskEmail(email),
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    };
  },

  /** Phase 1 Login: verify password, then generate & email short-lived OTP */
  async login(input: LoginInput): Promise<LoginMfaChallenge> {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    // Constant-time mitigation against user enumeration
    if (!user) {
      await bcrypt.compare(input.password, DUMMY_HASH);
      throw AppError.unauthorized("Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw AppError.unauthorized("Invalid email or password");
    }

    return this.initiateMfa(user.id, user.email, user.name);
  },

  /** Phase 2 OTP Verification: verify 6-digit OTP, issue session */
  async verifyOtp(
    input: VerifyOtpInput,
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuthResult> {
    const { userId, email } = tokenService.verifyMfa(input.mfaToken);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.email !== email) {
      throw AppError.unauthorized("Invalid or expired verification session.");
    }

    // Find the latest active OTP record
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        userId,
        purpose: "LOGIN_MFA",
        used: false,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      throw AppError.unauthorized("Invalid or expired verification code.");
    }

    const now = new Date();

    // Check expiry
    if (otpRecord.expiresAt < now) {
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { used: true },
      });
      throw AppError.unauthorized("Invalid or expired verification code.");
    }

    // Check max attempts
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { used: true },
      });
      throw AppError.unauthorized("Too many failed attempts. Please sign in again to request a new code.");
    }

    const submittedHash = hashSecret(input.otp.trim());
    const isMatch = safeCompareHashes(submittedHash, otpRecord.otpHash);

    if (!isMatch) {
      const nextAttempts = otpRecord.attempts + 1;
      const isExhausted = nextAttempts >= otpRecord.maxAttempts;

      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: {
          attempts: nextAttempts,
          used: isExhausted,
        },
      });

      if (isExhausted) {
        throw AppError.unauthorized("Too many failed attempts. Verification code has been invalidated.");
      }

      throw AppError.unauthorized("Invalid or expired verification code.");
    }

    // MATCH: Invalidate OTP immediately to prevent reuse
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        lastLogin: new Date(),
      },
    });

    // Create session in database
    const sessionToken = tokenService.sign({
      userId: updatedUser.id,
      role: updatedUser.role,
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

  /** Resend OTP with rate-limiting cooldown */
  async resendOtp(mfaToken: string): Promise<{ message: string; cooldownSeconds: number }> {
    const { userId, email } = tokenService.verifyMfa(mfaToken);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw AppError.unauthorized("Invalid or expired verification session.");
    }

    const latestOtp = await prisma.otpVerification.findFirst({
      where: {
        userId,
        purpose: "LOGIN_MFA",
      },
      orderBy: { createdAt: "desc" },
    });

    if (latestOtp) {
      const elapsed = Date.now() - latestOtp.lastResentAt.getTime();
      const cooldownMs = RESEND_COOLDOWN_SECONDS * 1000;
      if (elapsed < cooldownMs) {
        const remaining = Math.ceil((cooldownMs - elapsed) / 1000);
        throw new AppError(`Please wait ${remaining} second(s) before requesting a new code.`, 429);
      }
    }

    // Invalidate previous OTPs
    await prisma.otpVerification.updateMany({
      where: {
        userId,
        purpose: "LOGIN_MFA",
        used: false,
      },
      data: { used: true },
    });

    // Generate fresh OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashSecret(rawOtp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.otpVerification.create({
      data: {
        userId,
        otpHash,
        purpose: "LOGIN_MFA",
        expiresAt,
        attempts: 0,
        maxAttempts: MAX_OTP_ATTEMPTS,
        used: false,
        lastResentAt: new Date(),
      },
    });

    try {
      await emailService.sendOtpEmail({
        to: email,
        name: user.name,
        otp: rawOtp,
        expiresInMinutes: OTP_EXPIRY_MINUTES,
      });
    } catch (err: any) {
      console.error(`[auth.service] OTP resend email failed for userId=${userId}:`, err.message);
      if (process.env.NODE_ENV === "production") {
        throw AppError.internalError(
          `Unable to deliver new verification code to ${maskEmail(email)}: ${err.message}`
        );
      }
      console.warn(`[auth.service] Dev mode: continuing despite email resend error.`);
    }

    return {
      message: "A new 6-digit verification code has been dispatched to your email.",
      cooldownSeconds: RESEND_COOLDOWN_SECONDS,
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
