import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export function createRateLimiter(options: {
  max: number;
  windowMs: number;
  message: string;
}) {
  const store = new Map<string, RateLimitEntry>();

  // Periodic cleanup
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }, Math.min(options.windowMs, 5 * 60 * 1000));

  return (req: Request, res: Response, next: NextFunction) => {
    const ip =
      (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0].trim() ||
      req.socket.remoteAddress ||
      "unknown_ip";

    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now > entry.resetAt) {
      store.set(ip, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    entry.count += 1;

    if (entry.count > options.max) {
      const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfterSec));
      return next(new AppError(options.message, 429));
    }

    next();
  };
}

/** Rate-limiter for Phase 1 password login (5 attempts per 15m) */
export const loginRateLimit = createRateLimiter({
  max: 5,
  windowMs: 15 * 60 * 1000,
  message: "Too many login attempts. Please wait 15 minutes before trying again.",
});

/** Rate-limiter for Phase 2 OTP verification (5 attempts per 10m) */
export const otpVerifyRateLimit = createRateLimiter({
  max: 5,
  windowMs: 10 * 60 * 1000,
  message: "Too many verification attempts. Please wait a few minutes before trying again.",
});

/** Rate-limiter for OTP resend requests (3 requests per 10m) */
export const otpResendRateLimit = createRateLimiter({
  max: 3,
  windowMs: 10 * 60 * 1000,
  message: "Too many code requests. Please wait a few minutes before requesting another code.",
});

/** Rate-limiter for password reset requests (3 requests per 15m) */
export const passwordResetRateLimit = createRateLimiter({
  max: 3,
  windowMs: 15 * 60 * 1000,
  message: "Too many password reset requests. Please wait 15 minutes before trying again.",
});
