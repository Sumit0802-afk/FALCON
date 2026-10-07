import crypto from "crypto";
import { prisma } from "../database/prismaClient";
import { AppError } from "../utils/AppError";
import { authSecret } from "./token.service";

export const OTP_EXPIRY_SECONDS = 5 * 60;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
const MAX_VERIFY_ATTEMPTS = 5;
const MAX_CODES_PER_HOUR = 5;
const HOUR_MS = 60 * 60 * 1000;
const PURGE_AFTER_MS = 24 * HOUR_MS;
const LOGIN_PURPOSE = "LOGIN_MFA";

/**
 * A 6-digit code has only 1M possibilities, so a bare hash could be reversed
 * instantly from a leaked table. Keying the hash with the server secret (and
 * binding it to the user) makes stored hashes useless without that secret.
 */
function hashOtp(userId: string, otp: string): string {
  return crypto.createHmac("sha256", authSecret).update(`otp:${userId}:${otp}`).digest("hex");
}

function safeCompareHashes(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function expiredError() {
  return new AppError(
    "Your verification code has expired. Please request a new one.",
    401,
    "OTP_EXPIRED"
  );
}

function attemptsExceededError() {
  return new AppError(
    "Too many incorrect attempts. Please request a new verification code.",
    429,
    "OTP_ATTEMPTS_EXCEEDED"
  );
}

export const otpService = {
  /**
   * Creates a fresh login code for the user, invalidating any earlier one.
   * Enforces the per-account request limits. Returns the plain code so the
   * caller can email it; it is never stored or logged.
   */
  async issue(userId: string): Promise<{ id: string; otp: string; expiresAt: Date }> {
    const now = Date.now();

    const recent = await prisma.otpVerification.findMany({
      where: { userId, purpose: LOGIN_PURPOSE, createdAt: { gt: new Date(now - HOUR_MS) } },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    if (recent.length > 0) {
      const sinceLastMs = now - recent[0].createdAt.getTime();
      const cooldownMs = OTP_RESEND_COOLDOWN_SECONDS * 1000;
      if (sinceLastMs < cooldownMs) {
        const retryAfterSeconds = Math.ceil((cooldownMs - sinceLastMs) / 1000);
        throw new AppError(
          `Please wait ${retryAfterSeconds} seconds before requesting a new code.`,
          429,
          "OTP_COOLDOWN",
          { retryAfterSeconds }
        );
      }
    }

    if (recent.length >= MAX_CODES_PER_HOUR) {
      const oldest = recent[recent.length - 1].createdAt.getTime();
      const retryAfterSeconds = Math.max(1, Math.ceil((oldest + HOUR_MS - now) / 1000));
      throw new AppError(
        "Too many verification codes requested. Please try again later.",
        429,
        "OTP_RATE_LIMITED",
        { retryAfterSeconds }
      );
    }

    // A new code always invalidates the previous one
    await prisma.otpVerification.updateMany({
      where: { userId, purpose: LOGIN_PURPOSE, used: false },
      data: { used: true },
    });

    const otp = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
    const expiresAt = new Date(now + OTP_EXPIRY_SECONDS * 1000);

    const record = await prisma.otpVerification.create({
      data: {
        userId,
        otpHash: hashOtp(userId, otp),
        purpose: LOGIN_PURPOSE,
        expiresAt,
        maxAttempts: MAX_VERIFY_ATTEMPTS,
      },
      select: { id: true },
    });

    // Opportunistic cleanup of long-dead codes; never blocks a login
    prisma.otpVerification
      .deleteMany({ where: { expiresAt: { lt: new Date(now - PURGE_AFTER_MS) } } })
      .catch(() => undefined);

    return { id: record.id, otp, expiresAt };
  },

  /** Discards a code that could not be delivered, so it doesn't count against the user's limits */
  async discard(id: string): Promise<void> {
    await prisma.otpVerification.deleteMany({ where: { id } });
  },

  /**
   * Checks a submitted code against the user's active one. Resolves only when
   * the code is correct, and consumes it so it cannot be used again.
   */
  async verify(userId: string, otp: string): Promise<void> {
    const record = await prisma.otpVerification.findFirst({
      where: { userId, purpose: LOGIN_PURPOSE, used: false },
      orderBy: { createdAt: "desc" },
    });

    if (!record) throw expiredError();

    if (record.expiresAt.getTime() <= Date.now()) {
      await prisma.otpVerification.updateMany({ where: { id: record.id }, data: { used: true } });
      throw expiredError();
    }

    // Claim an attempt atomically so parallel guesses can't exceed the cap
    const claimed = await prisma.otpVerification.updateMany({
      where: { id: record.id, used: false, attempts: { lt: record.maxAttempts } },
      data: { attempts: { increment: 1 } },
    });
    if (claimed.count === 0) {
      await prisma.otpVerification.updateMany({ where: { id: record.id }, data: { used: true } });
      throw attemptsExceededError();
    }

    if (!safeCompareHashes(hashOtp(userId, otp), record.otpHash)) {
      const attemptsRemaining = Math.max(0, record.maxAttempts - (record.attempts + 1));
      if (attemptsRemaining === 0) {
        await prisma.otpVerification.updateMany({ where: { id: record.id }, data: { used: true } });
        throw attemptsExceededError();
      }
      throw new AppError("Incorrect verification code. Please try again.", 401, "OTP_INVALID", {
        attemptsRemaining,
      });
    }

    // Consume the code; only one request can win this update
    const consumed = await prisma.otpVerification.updateMany({
      where: { id: record.id, used: false },
      data: { used: true },
    });
    if (consumed.count === 0) throw expiredError();
  },
};
