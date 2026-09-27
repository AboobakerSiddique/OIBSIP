import mongoose from "mongoose";
import type { Request, Response } from "express";
import { errorHandler } from "../src/middleware/errorHandler";
import { ApiError } from "../src/utils/ApiError";

function makeMockRes() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe("errorHandler", () => {
  const req = {} as Request;
  const next = jest.fn();

  it("maps ApiError to its own statusCode and message", () => {
    const res = makeMockRes();
    errorHandler(ApiError.conflict("Duplicate thing"), req, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "Duplicate thing" })
    );
  });

  it("maps a Mongoose CastError (bad :id param) to 400, not 500", () => {
    const res = makeMockRes();
    const castError = new mongoose.Error.CastError("ObjectId", "not-a-real-id", "_id");
    errorHandler(castError, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.success).toBe(false);
    expect(payload.message).toContain("not-a-real-id");
  });

  it("maps a Mongoose ValidationError to 400 with per-field details", () => {
    const res = makeMockRes();
    const validationError = new mongoose.Error.ValidationError();
    validationError.errors.name = new mongoose.Error.ValidatorError({
      message: "Name is required",
      path: "name",
    });
    errorHandler(validationError, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.details).toContain("Name is required");
  });

  it("falls back to 500 for an unrecognized error type", () => {
    const res = makeMockRes();
    errorHandler(new Error("Something exploded"), req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("falls back to 500 for a completely non-Error thrown value", () => {
    const res = makeMockRes();
    errorHandler("just a string", req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.message).toBe("Internal server error");
  });
});
