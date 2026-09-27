import { z } from "zod";

const orderItemSchema = z
  .object({
    pizza: z.string().optional(),
    label: z.string().min(1),
    baseId: z.string().min(1).optional(),
    sauceId: z.string().min(1).optional(),
    cheeseId: z.string().min(1).optional(),
    vegetableIds: z.array(z.string()).default([]),
    quantity: z.number().int().min(1).max(20),
  })
  .superRefine((item, ctx) => {
    // A menu pizza order (item.pizza set) doesn't need ingredient ids —
    // the service prices it from the Pizza record directly. A custom
    // build (no item.pizza) needs all three to price and construct the
    // ingredient snapshot. This was a bug in the original Phase 2
    // schema: it required baseId/sauceId/cheeseId unconditionally even
    // though the service already branched on `pizza` and skipped them.
    if (!item.pizza) {
      if (!item.baseId) {
        ctx.addIssue({ code: "custom", path: ["baseId"], message: "Base is required for a custom build" });
      }
      if (!item.sauceId) {
        ctx.addIssue({ code: "custom", path: ["sauceId"], message: "Sauce is required for a custom build" });
      }
      if (!item.cheeseId) {
        ctx.addIssue({ code: "custom", path: ["cheeseId"], message: "Cheese is required for a custom build" });
      }
    }
  });

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "An order needs at least one item"),
});

export const verifyPaymentSchema = z.object({
  items: z.array(orderItemSchema).min(1, "An order needs at least one item"),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateOrderItemInput = z.infer<typeof orderItemSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
