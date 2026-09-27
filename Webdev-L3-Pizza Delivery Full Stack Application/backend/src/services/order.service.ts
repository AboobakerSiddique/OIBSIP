import mongoose, { Types } from "mongoose";
import { Order, type OrderItem } from "../models/Order";
import { Pizza } from "../models/Pizza";
import { InventoryItem } from "../models/InventoryItem";
import { ApiError } from "../utils/ApiError";
import { getRazorpayClient } from "../config/razorpay";
import { verifyRazorpaySignature } from "../utils/razorpaySignature";
import { env } from "../config/env";
import type {
  CreateOrderInput,
  CreateOrderItemInput,
  VerifyPaymentInput,
} from "../validation/order.schema";

const BASE_DOUGH_PRICE = 7;

export interface PricingInputs {
  basePrice: number;
  saucePrice: number;
  cheesePrice: number;
  vegetablePrices: number[];
  quantity: number;
}

export function computeCustomPizzaPrice(inputs: PricingInputs): {
  unitPrice: number;
  lineTotal: number;
} {
  const unitPrice =
    BASE_DOUGH_PRICE +
    inputs.basePrice +
    inputs.saucePrice +
    inputs.cheesePrice +
    inputs.vegetablePrices.reduce((sum, p) => sum + p, 0);

  return { unitPrice, lineTotal: unitPrice * inputs.quantity };
}

async function resolveIngredient(id: string, expectedCategory: string) {
  const item = await InventoryItem.findOne({ _id: id, isActive: true });
  if (!item) {
    throw ApiError.badRequest(`Selected ingredient is unavailable: ${id}`);
  }
  if (item.category !== expectedCategory) {
    throw ApiError.badRequest(
      `Ingredient "${item.name}" is not a valid ${expectedCategory} option`
    );
  }
  return item;
}

async function buildOrderItem(input: CreateOrderItemInput): Promise<OrderItem> {
  // Ordering a fixed menu pizza as-is, with no custom ingredient breakdown.
  if (input.pizza) {
    const pizza = await Pizza.findOne({ _id: input.pizza, isActive: true });
    if (!pizza) {
      throw ApiError.badRequest("Selected pizza is unavailable");
    }
    const lineTotal = pizza.price * input.quantity;
    return {
      pizza: pizza._id,
      label: pizza.name,
      base: { name: "As prepared", price: 0 },
      sauce: { name: "As prepared", price: 0 },
      cheese: { name: "As prepared", price: 0 },
      vegetables: [],
      quantity: input.quantity,
      unitPrice: pizza.price,
      lineTotal,
    };
  }

  if (!input.baseId || !input.sauceId || !input.cheeseId) {
    // Validation should have already caught this, but guard defensively
    // since this function may be called from more than one entry point.
    throw ApiError.badRequest("Base, sauce, and cheese are required for a custom build");
  }

  const base = await resolveIngredient(input.baseId, "Pizza Bases");
  const sauce = await resolveIngredient(input.sauceId, "Sauces");
  const cheese = await resolveIngredient(input.cheeseId, "Cheeses");
  const vegetables = await Promise.all(
    input.vegetableIds.map((id) => resolveIngredient(id, "Vegetables"))
  );

  const { unitPrice, lineTotal } = computeCustomPizzaPrice({
    basePrice: base.addOnPrice,
    saucePrice: sauce.addOnPrice,
    cheesePrice: cheese.addOnPrice,
    vegetablePrices: vegetables.map((v) => v.addOnPrice),
    quantity: input.quantity,
  });

  return {
    label: input.label || "Custom Build",
    base: { item: base._id, name: base.name, price: base.addOnPrice },
    sauce: { item: sauce._id, name: sauce.name, price: sauce.addOnPrice },
    cheese: { item: cheese._id, name: cheese.name, price: cheese.addOnPrice },
    vegetables: vegetables.map((v) => ({ item: v._id, name: v.name, price: v.addOnPrice })),
    quantity: input.quantity,
    unitPrice,
    lineTotal,
  };
}

async function buildOrderItems(inputs: CreateOrderItemInput[]): Promise<OrderItem[]> {
  return Promise.all(inputs.map(buildOrderItem));
}

/**
 * Aggregates how much of each raw InventoryItem an order needs, keyed
 * by ingredient id, accounting for per-line quantity. Pure and
 * DB-free — deliberately separated from the decrement step so it can
 * be unit-tested without a database.
 *
 * Note: only custom-build ingredients are tracked against inventory.
 * Fixed menu pizzas (item.base.item etc. are undefined — see
 * buildOrderItem's "As prepared" branch) aren't linked to a
 * bill-of-materials in this schema, so they don't decrement stock.
 * This mirrors the Phase 2 data model rather than expanding scope here.
 */
export function computeRequiredQuantities(items: OrderItem[]): Map<string, number> {
  const required = new Map<string, number>();

  for (const item of items) {
    const ingredientIds = [
      item.base.item,
      item.sauce.item,
      item.cheese.item,
      ...item.vegetables.map((v) => v.item),
    ];

    for (const id of ingredientIds) {
      if (!id) continue;
      const key = id.toString();
      required.set(key, (required.get(key) ?? 0) + item.quantity);
    }
  }

  return required;
}

/**
 * Non-mutating, best-effort check used at checkout time so a customer
 * isn't sent to payment for something already out of stock. This is
 * NOT the authoritative check — stock can change between checkout and
 * payment completion, so the real guarantee comes from the atomic
 * decrement in decrementInventoryOrThrow at verification time.
 */
async function assertStockLikelyAvailable(required: Map<string, number>): Promise<void> {
  if (required.size === 0) return;

  const items = await InventoryItem.find({ _id: { $in: [...required.keys()] } });
  const byId = new Map(items.map((i) => [i._id.toString(), i]));

  const shortages: string[] = [];
  for (const [id, qty] of required) {
    const item = byId.get(id);
    if (!item || item.quantity < qty) {
      shortages.push(item?.name ?? id);
    }
  }

  if (shortages.length > 0) {
    throw ApiError.conflict(`Insufficient stock for: ${shortages.join(", ")}`);
  }
}

/**
 * The authoritative stock check: atomically decrements each required
 * ingredient only if enough stock exists (quantity >= required in the
 * same conditional update), inside the caller's transaction session.
 * If any single decrement fails, the caller aborts the whole
 * transaction — so a mid-order stock conflict never leaves some
 * ingredients decremented and others not.
 */
async function decrementInventoryOrThrow(
  required: Map<string, number>,
  session: mongoose.ClientSession
): Promise<void> {
  for (const [id, qty] of required) {
    const updated = await InventoryItem.findOneAndUpdate(
      { _id: id, quantity: { $gte: qty } },
      { $inc: { quantity: -qty } },
      { new: true, session }
    );

    if (!updated) {
      const item = await InventoryItem.findById(id).session(session);
      throw ApiError.conflict(
        `Insufficient stock for "${item?.name ?? id}" — it may have sold out while you were checking out`
      );
    }
  }
}

function sumTotal(items: OrderItem[]): number {
  return Math.round(items.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100;
}

/**
 * Step 1 of the payment flow: price the draft server-side (never trust
 * a client-supplied price) and open a Razorpay order for that amount.
 * No Order document is created yet — that only happens once the
 * payment is verified, in verifyAndCreateOrder below.
 */
export async function initiateCheckout(input: CreateOrderInput) {
  const items = await buildOrderItems(input.items);
  await assertStockLikelyAvailable(computeRequiredQuantities(items));

  const totalAmount = sumTotal(items);
  const amountInPaise = Math.round(totalAmount * 100);

  const razorpay = getRazorpayClient();
  const razorpayOrder = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `bp_${Date.now()}`,
  });

  return {
    razorpayOrderId: razorpayOrder.id,
    amount: amountInPaise,
    currency: razorpayOrder.currency,
    keyId: env.RAZORPAY_KEY_ID,
    totalAmount,
  };
}

/**
 * Step 2: verify the payment actually happened before creating anything.
 * Three independent checks, all required:
 *   1. HMAC signature matches (proves the payment response came from
 *      Razorpay, not a client claiming success).
 *   2. This payment ID hasn't already been used to create an order
 *      (idempotency — protects against retries/duplicate submissions).
 *   3. The amount actually authorized on the Razorpay order matches
 *      what re-pricing the items server-side produces (protects against
 *      a client paying for a cheap order but submitting an expensive
 *      item list at verification time, or vice versa).
 */
export async function verifyAndCreateOrder(userId: string, input: VerifyPaymentInput) {
  const isValidSignature = verifyRazorpaySignature(
    {
      razorpay_order_id: input.razorpay_order_id,
      razorpay_payment_id: input.razorpay_payment_id,
      razorpay_signature: input.razorpay_signature,
    },
    env.RAZORPAY_KEY_SECRET
  );

  if (!isValidSignature) {
    throw ApiError.badRequest("Payment verification failed");
  }

  const existing = await Order.findOne({ razorpayPaymentId: input.razorpay_payment_id });
  if (existing) {
    // Idempotent: return the order that was already created for this
    // payment rather than erroring or creating a duplicate.
    return existing;
  }

  const items = await buildOrderItems(input.items);
  const totalAmount = sumTotal(items);

  const razorpay = getRazorpayClient();
  const razorpayOrder = await razorpay.orders.fetch(input.razorpay_order_id);
  const expectedAmountPaise = Math.round(totalAmount * 100);

  if (Number(razorpayOrder.amount) !== expectedAmountPaise) {
    throw ApiError.badRequest(
      "Payment amount does not match the order total — refusing to create the order"
    );
  }

  const session = await mongoose.startSession();
  try {
    let createdOrder;
    await session.withTransaction(async () => {
      await decrementInventoryOrThrow(computeRequiredQuantities(items), session);

      const [order] = await Order.create(
        [
          {
            user: new Types.ObjectId(userId),
            items,
            totalAmount,
            paymentStatus: "Paid",
            status: "Order Received",
            razorpayOrderId: input.razorpay_order_id,
            razorpayPaymentId: input.razorpay_payment_id,
          },
        ],
        { session }
      );
      createdOrder = order;
    });

    return createdOrder;
  } finally {
    await session.endSession();
  }
}

export async function listOrdersForUser(userId: string) {
  return Order.find({ user: userId }).sort({ createdAt: -1 });
}

export async function getOrderForUser(userId: string, orderId: string) {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    // 404 rather than 403 — do not reveal whether an order belonging
    // to someone else exists.
    throw ApiError.notFound("Order not found");
  }
  return order;
}
