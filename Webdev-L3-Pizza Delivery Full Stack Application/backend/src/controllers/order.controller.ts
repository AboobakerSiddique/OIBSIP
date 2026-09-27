import type { Response } from "express";
import type { Request } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import * as orderService from "../services/order.service";

export const checkout = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.initiateCheckout(req.body);
  res.status(200).json({ success: true, data: result });
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw ApiError.unauthorized();
  const order = await orderService.verifyAndCreateOrder(req.auth.id, req.body);
  res.status(201).json({ success: true, data: order });
});

export const listMyOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw ApiError.unauthorized();
  const orders = await orderService.listOrdersForUser(req.auth.id);
  res.status(200).json({ success: true, data: orders });
});

export const getMyOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw ApiError.unauthorized();
  const order = await orderService.getOrderForUser(req.auth.id, req.params.id as string);
  res.status(200).json({ success: true, data: order });
});
