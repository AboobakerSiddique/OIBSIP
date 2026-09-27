import { Router } from "express";
import { validate } from "../middleware/validate";
import { requireUser } from "../middleware/requireUser";
import { authLimiter } from "../middleware/rateLimit";
import {
  register,
  login,
  logout,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validation/auth.schema";
import { z } from "zod";

const router = Router();

// authLimiter applies to the endpoints attackers actually target:
// credential stuffing against /login, mass account creation against
// /register, and enumeration/spam against /forgot-password and
// /resend-verification. Session checks (/me) and /logout are excluded
// — there's nothing to brute-force there, and limiting them would just
// break legitimate polling/UI refresh patterns.
router.post("/register", authLimiter, validate({ body: registerSchema }), register);
router.post("/login", authLimiter, validate({ body: loginSchema }), login);
router.post("/logout", logout);
router.get("/me", requireUser, getMe);
router.post("/verify-email", validate({ body: verifyEmailSchema }), verifyEmail);
router.post(
  "/resend-verification",
  authLimiter,
  validate({ body: z.object({ email: z.string().email() }) }),
  resendVerification
);
router.post("/forgot-password", authLimiter, validate({ body: forgotPasswordSchema }), forgotPassword);
router.post("/reset-password", validate({ body: resetPasswordSchema }), resetPassword);

export default router;
