import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/** Rate-limiter middleware. Limits requests per IP to MAX_ATTEMPTS per WINDOW_MS. */
export function loginRateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0].trim()
    ?? req.socket.remoteAddress
    ?? "unknown";

  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  entry.count += 1;

  if (entry.count > MAX_ATTEMPTS) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader("Retry-After", String(retryAfterSec));
    return next(
      new AppError(
        `Too many login attempts. Please try again in ${Math.ceil(retryAfterSec / 60)} minute(s).`,
        429
      )
    );
  }

  next();
}

// Periodically clean up expired entries to avoid memory leaks (every 30 min)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(ip);
    }
  }
}, 30 * 60 * 1000);
