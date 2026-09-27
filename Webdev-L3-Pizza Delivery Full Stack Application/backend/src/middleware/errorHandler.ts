import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

/**
 * Single place where all errors (thrown, next(err), or async-rejected)
 * are turned into a consistent JSON response. Never leaks stack traces
 * or internals in production.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = "Internal server error";
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof mongoose.Error.CastError) {
    // Thrown when a route param like :id isn't a well-formed ObjectId
    // (e.g. GET /api/pizzas/not-a-real-id). Without this, every :id
    // route would need its own manual ObjectId format check just to
    // avoid an ugly 500 — handling it once here covers all of them.
    statusCode = 400;
    message = `Invalid ${err.path}: "${err.value}"`;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation failed";
    details = Object.values(err.errors).map((e) => e.message);
  } else if (err instanceof Error) {
    message = err.message;
  }

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error("[error]", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(env.NODE_ENV === "development" && err instanceof Error
      ? { stack: err.stack }
      : {}),
  });
}

export default errorHandler;
