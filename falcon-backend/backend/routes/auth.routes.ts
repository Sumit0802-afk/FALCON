import { Router } from "express";
import { z } from "zod";
import { authController } from "../controllers/auth.controller";
import { validateBody } from "../middleware/validate.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import {
  loginRateLimit,
  otpResendRateLimit,
  otpVerifyRateLimit,
  passwordResetRateLimit,
} from "../middleware/rateLimit.middleware";

const router = Router();

const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("A valid email is required"),
    password: passwordValidation,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.string().email("A valid email is required"),
  password: z.string().min(1, "Password is required"),
});

const verifyOtpSchema = z.object({
  mfaToken: z.string().min(1, "Verification session token is required"),
  otp: z
    .string()
    .length(6, "Verification code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Verification code must contain digits only"),
});

const resendOtpSchema = z.object({
  mfaToken: z.string().min(1, "Verification session token is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("A valid email is required"),
});

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: passwordValidation,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Routes
router.post(
  "/register",
  loginRateLimit,
  validateBody(registerSchema),
  (req, _res, next) => {
    const { confirmPassword: _cp, ...rest } = req.body;
    req.body = rest;
    next();
  },
  authController.register
);

router.post("/login", loginRateLimit, validateBody(loginSchema), authController.login);

router.post(
  "/verify-otp",
  otpVerifyRateLimit,
  validateBody(verifyOtpSchema),
  authController.verifyOtp
);

router.post(
  "/resend-otp",
  otpResendRateLimit,
  validateBody(resendOtpSchema),
  authController.resendOtp
);

router.post(
  "/forgot-password",
  passwordResetRateLimit,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword
);

router.post(
  "/reset-password",
  passwordResetRateLimit,
  validateBody(resetPasswordSchema),
  (req, _res, next) => {
    const { confirmPassword: _cp, ...rest } = req.body;
    req.body = rest;
    next();
  },
  authController.resetPassword
);

router.post("/logout", authController.logout);

router.get("/me", requireAuth, authController.me);

export default router;
