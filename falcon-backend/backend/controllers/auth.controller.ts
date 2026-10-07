import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { authService } from "../services/auth.service";
import { extractAuthToken } from "../middleware/auth.middleware";
import { emailService } from "../services/email.service";

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
  /** Register new account */
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  }),

  /** Step 1: verify email & password, then email the 6-digit OTP */
  login: asyncHandler(async (req: Request, res: Response) => {
    const challenge = await authService.login(req.body);
    res.status(200).json(challenge);
  }),

  /** Step 2: verify 6-digit OTP and establish secure session */
  verifyOtp: asyncHandler(async (req: Request, res: Response) => {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    const result = await authService.verifyOtp(req.body, { ipAddress, userAgent });

    // Set secure HttpOnly session cookie
    setSessionCookie(res, result.token);

    // Return authenticated user & token for hybrid clients
    res.status(200).json({
      success: true,
      user: result.user,
      token: result.token,
      message: "Authentication successful.",
    });
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

  /** Update the signed-in user's profile */
  updateMe: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw AppError.unauthorized("Authentication required");
    const user = await authService.updateProfile(req.userId, req.body);
    res.status(200).json({ user });
  }),

  /** Change password; other devices are signed out */
  changePassword: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw AppError.unauthorized("Authentication required");
    const result = await authService.changePassword(req.userId, req.body, req.sessionToken);
    res.status(200).json(result);
  }),

  /** List the account's active sessions */
  sessions: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw AppError.unauthorized("Authentication required");
    const sessions = await authService.listSessions(req.userId, req.sessionToken);
    res.status(200).json({ sessions });
  }),

  /** Sign out every other device */
  logoutOthers: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw AppError.unauthorized("Authentication required");
    const result = await authService.revokeOtherSessions(req.userId, req.sessionToken);
    res.status(200).json(result);
  }),

  /** Email a help request from the signed-in user to Falcon support */
  contactSupport: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw AppError.unauthorized("Authentication required");
    const user = await authService.getById(req.userId);
    try {
      await emailService.sendSupportRequest({
        fromName: user.name,
        fromEmail: user.email,
        topic: req.body.topic,
        subject: req.body.subject,
        message: req.body.message,
      });
    } catch {
      throw new AppError("We couldn't send your message. Please try again in a moment.", 502, "EMAIL_DELIVERY_FAILED");
    }
    res.status(200).json({ success: true, message: "Your message has been sent. We'll reply to your account email." });
  }),

  /** Return current authenticated user profile */
  me: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) throw AppError.unauthorized("Authentication required");
    const user = await authService.getById(req.userId);
    res.status(200).json({ user });
  }),
};
