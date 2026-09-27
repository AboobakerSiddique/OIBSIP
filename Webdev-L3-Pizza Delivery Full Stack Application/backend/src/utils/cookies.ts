import type { CookieOptions } from "express";
import { env } from "../config/env";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function authCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SEVEN_DAYS_MS,
    path: "/",
  };
}
