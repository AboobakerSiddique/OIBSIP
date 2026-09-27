import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as authService from "../services/auth.service";
import { env } from "../config/env";
import { authCookieOptions } from "../utils/cookies";
import { ApiError } from "../utils/ApiError";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json({
    success: true,
    message: "Account created. Check your email to verify your account.",
    data: {
      user: result.user,
      ...(env.NODE_ENV === "production" ? {} : { verificationToken: result.verificationToken }),
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);
  res.cookie("token", result.token, authCookieOptions());
  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: result,
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("token", { path: "/" });
  res.status(200).json({ success: true, message: "Logged out" });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw ApiError.unauthorized();
  const user = await authService.getCurrentUser(req.auth.id);
  res.status(200).json({ success: true, data: user });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.verifyEmail(req.body.token);
  res.status(200).json({
    success: true,
    message: "Email verified successfully",
    data: result,
  });
});

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resendVerification(req.body.email);
  res.status(200).json({
    success: true,
    message: "If that account exists and is unverified, a new link has been issued.",
    data: env.NODE_ENV === "production" ? undefined : result,
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.forgotPassword(req.body.email);
  res.status(200).json({
    success: true,
    message: "If that account exists, a reset link has been issued.",
    data: env.NODE_ENV === "production" ? undefined : result,
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resetPassword(req.body.token, req.body.password);
  res.status(200).json({
    success: true,
    message: "Password updated successfully",
    data: result,
  });
});
