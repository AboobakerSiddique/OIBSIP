import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length);
  }
  if (req.cookies?.token) {
    return req.cookies.token as string;
  }
  return null;
}

/**
 * Requires a valid user-role JWT. Admin tokens are deliberately rejected
 * here so a leaked/misused admin token can't be replayed against user
 * routes — see requireAdmin for the mirror image of this check.
 */
export function requireUser(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    next(ApiError.unauthorized("Authentication required"));
    return;
  }

  try {
    const payload = verifyToken(token);
    if (payload.role !== "user") {
      next(ApiError.forbidden("This action requires a user account"));
      return;
    }
    req.auth = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired token"));
  }
}

export default requireUser;
