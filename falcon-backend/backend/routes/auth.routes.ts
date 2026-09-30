import { Router } from "express";
import { z } from "zod";
import { authController } from "../controllers/auth.controller";
import { validateBody } from "../middleware/validate.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import { loginRateLimit } from "../middleware/rateLimit.middleware";

const router = Router();

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("A valid email is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
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

router.post(
  "/register",
  validateBody(registerSchema),
  (req, _res, next) => {
    // Strip confirmPassword before passing to service
    const { confirmPassword: _cp, ...rest } = req.body;
    req.body = rest;
    next();
  },
  authController.register
);
router.post("/login", loginRateLimit, validateBody(loginSchema), authController.login);
router.get("/me", requireAuth, authController.me);

// Stateless logout — client clears token; server acknowledges
router.post("/logout", (_req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

export default router;
