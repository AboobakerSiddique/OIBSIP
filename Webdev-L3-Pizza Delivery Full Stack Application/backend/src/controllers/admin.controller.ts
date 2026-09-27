import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as adminService from "../services/admin.service";
import { authCookieOptions } from "../utils/cookies";
import { ApiError } from "../utils/ApiError";
import { Admin } from "../models/Admin";

export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.loginAdmin(req.body);
  res.cookie("adminToken", result.token, authCookieOptions());
  res.status(200).json({ success: true, message: "Logged in successfully", data: result });
});

export const adminLogout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("adminToken", { path: "/" });
  res.status(200).json({ success: true, message: "Logged out" });
});

export const getAdminMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw ApiError.unauthorized();
  const admin = await Admin.findById(req.auth.id);
  if (!admin) throw ApiError.unauthorized("Account no longer exists");
  res.status(200).json({
    success: true,
    data: { id: admin._id.toString(), name: admin.name, email: admin.email },
  });
});

export const getInventory = asyncHandler(async (_req: Request, res: Response) => {
  const items = await adminService.listInventory();
  res.status(200).json({ success: true, data: items });
});

export const patchInventoryItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await adminService.updateInventoryItem(req.params.id as string, req.body);
  res.status(200).json({ success: true, data: item });
});

export const getAllOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await adminService.listAllOrders();
  res.status(200).json({ success: true, data: orders });
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await adminService.getOrderById(req.params.id as string);
  res.status(200).json({ success: true, data: order });
});

export const patchOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await adminService.updateOrderStatus(req.params.id as string, req.body.status);
  res.status(200).json({ success: true, data: order });
});

export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await adminService.getSettings();
  res.status(200).json({ success: true, data: settings });
});

export const patchSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await adminService.updateSettings(req.body);
  res.status(200).json({ success: true, data: settings });
});
