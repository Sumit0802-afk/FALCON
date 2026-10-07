import { Router } from "express";
import { z } from "zod";
import { authController } from "../controllers/auth.controller";
import { validateBody } from "../middleware/validate.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import {
  loginRateLimit,
  otpVerifyRateLimit,
  passwordResetRateLimit,
  accountChangeRateLimit,
  supportRateLimit,
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

const emailField = z.string().trim().toLowerCase().max(254).email("A valid email is required");

const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required").max(200),
});

const verifyOtpSchema = z.object({
  email: emailField,
  otp: z
    .string()
    .length(6, "Verification code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Verification code must contain digits only"),
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

const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password").max(200),
    newPassword: passwordValidation.max(200),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const supportSchema = z.object({
  topic: z.enum(["general", "account", "billing", "bug", "feedback"]).default("general"),
  subject: z.string().trim().min(3, "Add a short subject").max(150),
  message: z.string().trim().min(10, "Tell us a little more so we can help").max(4000),
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
router.patch("/me", requireAuth, validateBody(updateProfileSchema), authController.updateMe);

router.post(
  "/change-password",
  requireAuth,
  accountChangeRateLimit,
  validateBody(changePasswordSchema),
  (req, _res, next) => {
    const { confirmPassword: _cp, ...rest } = req.body;
    req.body = rest;
    next();
  },
  authController.changePassword
);

router.get("/sessions", requireAuth, authController.sessions);
router.post("/logout-others", requireAuth, authController.logoutOthers);

router.post("/support", requireAuth, supportRateLimit, validateBody(supportSchema), authController.contactSupport);

export default router;
