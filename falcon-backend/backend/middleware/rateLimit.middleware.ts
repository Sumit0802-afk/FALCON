import { NextFunction, Request, Response } from "express";
import { prisma } from "../database/prismaClient";
import { AppError } from "../utils/AppError";

/**
 * Counts requests per person or per address, and turns away those over a limit.
 *
 * The counts are kept in the database, so every server instance shares them:
 * a host that runs the API as many short-lived functions would otherwise give
 * each new instance a fresh count. Should the database not answer, the count
 * falls back to this instance's memory rather than letting everything through.
 * Test runs count in memory only, so one run's counts do not carry into the next.
 */

interface Hit {
  count: number;
  resetAt: number;
}

const memory = new Map<string, Hit>();

function hitInMemory(key: string, windowMs: number, amount: number): Hit {
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || now > entry.resetAt) {
    const fresh = { count: amount, resetAt: now + windowMs };
    memory.set(key, fresh);
    return fresh;
  }
  entry.count += amount;
  return entry;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memory.entries()) if (now > entry.resetAt) memory.delete(key);
}, 5 * 60 * 1000).unref();

let sweepAt = 0;

async function hitInDatabase(key: string, windowMs: number, amount: number): Promise<Hit> {
  // One statement: a key whose window has passed starts again, otherwise its count grows
  const rows = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>`
    INSERT INTO rate_limits ("key", "count", "resetAt")
    VALUES (${key}, ${amount}, NOW() + (${windowMs} * INTERVAL '1 millisecond'))
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN rate_limits."resetAt" < NOW() THEN ${amount} ELSE rate_limits."count" + ${amount} END,
      "resetAt" = CASE WHEN rate_limits."resetAt" < NOW() THEN EXCLUDED."resetAt" ELSE rate_limits."resetAt" END
    RETURNING "count", "resetAt"`;
  // Now and then, counts whose windows have long passed are cleared away
  if (Date.now() > sweepAt) {
    sweepAt = Date.now() + 10 * 60 * 1000;
    prisma.$executeRaw`DELETE FROM rate_limits WHERE "resetAt" < NOW() - INTERVAL '1 day'`.catch(() => undefined);
  }
  return { count: Number(rows[0].count), resetAt: new Date(rows[0].resetAt).getTime() };
}

/** Adds `amount` to a key's count within its window and returns the new count */
export async function hit(key: string, windowMs: number, amount = 1): Promise<Hit> {
  if (process.env.NODE_ENV === "test") return hitInMemory(key, windowMs, amount);
  try {
    return await hitInDatabase(key, windowMs, amount);
  } catch {
    return hitInMemory(key, windowMs, amount);
  }
}

/**
 * Counts per signed-in person where the route knows who that is, and per IP
 * address otherwise. `req.ip` honours the app's "trust proxy" setting, so a
 * client cannot dodge the limit by sending its own X-Forwarded-For header.
 */
export function createRateLimiter(options: { name: string; max: number; windowMs: number; message: string }) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const who = req.userId ? `u:${req.userId}` : `ip:${req.ip || req.socket.remoteAddress || "unknown"}`;
    try {
      const { count, resetAt } = await hit(`${options.name}:${who}`, options.windowMs);
      if (count > options.max) {
        const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
        return next(new AppError(options.message, 429, "RATE_LIMITED", { retryAfterSeconds }));
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Per-IP limit on password login and registration (5 per 15m). Every login
 * emails an OTP, so this also caps code requests per IP; the per-email limit
 * lives in otp.service.
 */
export const loginRateLimit = createRateLimiter({
  name: "login",
  max: 5,
  windowMs: 15 * 60 * 1000,
  message: "Too many login attempts. Please wait 15 minutes before trying again.",
});

/** Per-IP limit on OTP verification and Google sign-in (10 per 10m). Each code also has its own attempt cap. */
export const otpVerifyRateLimit = createRateLimiter({
  name: "verify",
  max: 10,
  windowMs: 10 * 60 * 1000,
  message: "Too many verification attempts. Please wait a few minutes before trying again.",
});

/** Limit on test sends from the email designer (5 per 10m) */
export const emailTestRateLimit = createRateLimiter({
  name: "mail-test",
  max: 5,
  windowMs: 10 * 60 * 1000,
  message: "Too many test emails. Please wait a few minutes before sending another.",
});

/** Limit on asking how a design will be sent; the preview asks again after each edit (240 per 10m) */
export const emailCompatRateLimit = createRateLimiter({
  name: "mail-compat",
  max: 240,
  windowMs: 10 * 60 * 1000,
  message: "Too many preview requests. Please wait a moment.",
});

/** Limit on sending a finished design to recipients (10 per 10m); the daily recipient quota is separate */
export const emailSendRateLimit = createRateLimiter({
  name: "mail-send",
  max: 10,
  windowMs: 10 * 60 * 1000,
  message: "Too many emails sent. Please wait a few minutes before sending another.",
});

/** Limit on password changes from the account page (5 per 15m) */
export const accountChangeRateLimit = createRateLimiter({
  name: "account",
  max: 5,
  windowMs: 15 * 60 * 1000,
  message: "Too many attempts. Please wait 15 minutes before trying again.",
});

/** Limit on AI requests that ask a model, each of which costs money (30 per 10 minutes) */
export const aiRateLimit = createRateLimiter({
  name: "ai",
  max: 30,
  windowMs: 10 * 60 * 1000,
  message: "You've asked for a lot of designs in a short time. Please wait a few minutes and try again.",
});

/** Limit on AI-side work that asks no model but still takes the server's time (120 per 10 minutes) */
export const aiLightRateLimit = createRateLimiter({
  name: "ai-light",
  max: 120,
  windowMs: 10 * 60 * 1000,
  message: "That's a lot of requests in a short time. Please wait a few minutes and try again.",
});

/** Limit on picture uploads (60 per 10 minutes) */
export const uploadRateLimit = createRateLimiter({
  name: "upload",
  max: 60,
  windowMs: 10 * 60 * 1000,
  message: "You've uploaded a lot in a short time. Please wait a few minutes and try again.",
});

/** Limit on saving and changing projects; the editor saves as you work (900 per 10 minutes) */
export const projectWriteRateLimit = createRateLimiter({
  name: "project",
  max: 900,
  windowMs: 10 * 60 * 1000,
  message: "Too many changes in a short time. Please wait a moment and try again.",
});

/** Limit on messages to support (5 per hour) */
export const supportRateLimit = createRateLimiter({
  name: "support",
  max: 5,
  windowMs: 60 * 60 * 1000,
  message: "You've sent several messages. Please wait a while before sending another.",
});

/** Rate-limiter for password reset requests (3 requests per 15m) */
export const passwordResetRateLimit = createRateLimiter({
  name: "reset",
  max: 3,
  windowMs: 15 * 60 * 1000,
  message: "Too many password reset requests. Please wait 15 minutes before trying again.",
});
