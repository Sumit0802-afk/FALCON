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
  }, Math.min(options.windowMs, 5 * 60 * 1000)).unref();

  return (req: Request, _res: Response, next: NextFunction) => {
    // req.ip honours the app's "trust proxy" setting, so a client cannot dodge
    // the limit by sending its own X-Forwarded-For header
    const ip = req.ip || req.socket.remoteAddress || "unknown_ip";

    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now > entry.resetAt) {
      store.set(ip, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    entry.count += 1;

    if (entry.count > options.max) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
      return next(new AppError(options.message, 429, "RATE_LIMITED", { retryAfterSeconds }));
    }

    next();
  };
}

/**
 * Per-IP limit on password login and registration (5 per 15m). Every login
 * emails an OTP, so this also caps code requests per IP; the per-email limit
 * lives in otp.service.
 */
export const loginRateLimit = createRateLimiter({
  max: 5,
  windowMs: 15 * 60 * 1000,
  message: "Too many login attempts. Please wait 15 minutes before trying again.",
});

/** Per-IP limit on OTP verification (10 per 10m). Each code also has its own attempt cap. */
export const otpVerifyRateLimit = createRateLimiter({
  max: 10,
  windowMs: 10 * 60 * 1000,
  message: "Too many verification attempts. Please wait a few minutes before trying again.",
});

/** Per-IP limit on test sends from the email designer (5 per 10m) */
export const emailTestRateLimit = createRateLimiter({
  max: 5,
  windowMs: 10 * 60 * 1000,
  message: "Too many test emails. Please wait a few minutes before sending another.",
});

/** Per-IP limit on sending a finished design to recipients (10 per 10m) */
export const emailSendRateLimit = createRateLimiter({
  max: 10,
  windowMs: 10 * 60 * 1000,
  message: "Too many emails sent. Please wait a few minutes before sending another.",
});

/** Per-IP limit on password changes from the account page (5 per 15m) */
export const accountChangeRateLimit = createRateLimiter({
  max: 5,
  windowMs: 15 * 60 * 1000,
  message: "Too many attempts. Please wait 15 minutes before trying again.",
});

/** Per-IP limit on messages to support (5 per hour) */
export const supportRateLimit = createRateLimiter({
  max: 5,
  windowMs: 60 * 60 * 1000,
  message: "You've sent several messages. Please wait a while before sending another.",
});

/** Rate-limiter for password reset requests (3 requests per 15m) */
export const passwordResetRateLimit = createRateLimiter({
  max: 3,
  windowMs: 15 * 60 * 1000,
  message: "Too many password reset requests. Please wait 15 minutes before trying again.",
});
