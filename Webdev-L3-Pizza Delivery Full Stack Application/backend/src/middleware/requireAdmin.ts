import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length);
  }
  if (req.cookies?.adminToken) {
    return req.cookies.adminToken as string;
  }
  return null;
}

/**
 * Requires a valid admin-role JWT. This is the only way to satisfy
 * admin-protected routes — there is no user->admin escalation path,
 * since admin accounts are never created through user registration.
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    next(ApiError.unauthorized("Admin authentication required"));
    return;
  }

  try {
    const payload = verifyToken(token);
    if (payload.role !== "admin") {
      next(ApiError.forbidden("Admin access required"));
      return;
    }
    req.auth = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired admin token"));
  }
}

export default requireAdmin;
