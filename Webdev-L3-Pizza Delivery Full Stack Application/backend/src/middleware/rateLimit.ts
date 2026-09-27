import rateLimit from "express-rate-limit";

// Applied globally: generous enough not to bother real users, enough
// to blunt basic scripted abuse.
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});

// Applied to login/register/forgot-password/admin-login specifically —
// these are the endpoints brute-force and credential-stuffing attempts
// actually target, so they get a much tighter limit than general
// browsing/API traffic.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again in a few minutes." },
});
