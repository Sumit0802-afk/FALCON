import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { authService } from "../services/auth.service";
import { emailService } from "../services/email.service";
import { extractAuthToken } from "../middleware/auth.middleware";

const SESSION_COOKIE_NAME = "falcon_session";

function setSessionCookie(res: Response, token: string) {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
}

function clearSessionCookie(res: Response) {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });
}

export const authController = {
  /** Register new account and send OTP challenge */
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  }),

  /** Phase 1: verify email & password, dispatch 6-digit OTP */
  login: asyncHandler(async (req: Request, res: Response) => {
    const challenge = await authService.login(req.body);
    res.status(200).json(challenge);
  }),

  /** Phase 2: verify 6-digit OTP and establish secure session */
  verifyOtp: asyncHandler(async (req: Request, res: Response) => {
    const ipAddress =
      (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0].trim() ||
      req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    const result = await authService.verifyOtp(req.body, { ipAddress, userAgent });

    // Set secure HttpOnly session cookie
    setSessionCookie(res, result.token);

    // Return authenticated user & token for hybrid clients
    res.status(200).json({
      user: result.user,
      token: result.token,
      message: "Authentication successful.",
    });
  }),

  /** Request a new OTP with rate limiting and cooldown */
  resendOtp: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.resendOtp(req.body.mfaToken);
    res.status(200).json(result);
  }),

  /** Request password reset email */
  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : undefined);
    const result = await authService.forgotPassword(req.body.email, origin);
    res.status(200).json(result);
  }),

  /** Reset password using verified reset token */
  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.resetPassword(req.body);
    res.status(200).json(result);
  }),

  /** Revoke session and clear cookies */
  logout: asyncHandler(async (req: Request, res: Response) => {
    const token = extractAuthToken(req);
    if (token) {
      await authService.logout(token);
    }
    clearSessionCookie(res);
    res.status(200).json({ message: "Logged out successfully" });
  }),

  /** Return current authenticated user profile */
  me: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw AppError.unauthorized("Authentication required");
    const user = await authService.getById(req.userId);
    res.status(200).json({ user });
  }),
};
