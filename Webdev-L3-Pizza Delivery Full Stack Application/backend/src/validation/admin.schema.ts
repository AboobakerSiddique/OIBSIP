import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateInventorySchema = z.object({
  quantity: z.number().min(0).optional(),
  threshold: z.number().min(0).optional(),
  addOnPrice: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["Order Received", "In Kitchen", "Sent to Delivery"]),
});

export const updateSettingsSchema = z.object({
  notifyEmail: z.string().email("Must be a valid email").optional(),
  defaultThreshold: z.number().min(0).optional(),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
