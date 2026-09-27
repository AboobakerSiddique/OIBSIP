import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type TokenRole = "user" | "admin";

export interface TokenPayload {
  sub: string;
  role: TokenRole;
}

export function signToken(payload: TokenPayload): string {
  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): TokenPayload {
  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
