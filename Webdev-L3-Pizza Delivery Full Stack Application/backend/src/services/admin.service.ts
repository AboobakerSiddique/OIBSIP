import { Admin } from "../models/Admin";
import { InventoryItem } from "../models/InventoryItem";
import { Order, type OrderStatus } from "../models/Order";
import { Settings, SETTINGS_ID } from "../models/Settings";
import { comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { computeStockStatus } from "../utils/stockStatus";
import type { AdminLoginInput, UpdateInventoryInput, UpdateSettingsInput } from "../validation/admin.schema";

// Valid forward-only transitions — an order can't skip a stage or move
// backward once it's progressed.
const ORDER_STATUS_FLOW: OrderStatus[] = [
  "Order Received",
  "In Kitchen",
  "Sent to Delivery",
];

export async function loginAdmin(input: AdminLoginInput) {
  const admin = await Admin.findOne({ email: input.email }).select("+password");
  if (!admin) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isMatch = await comparePassword(input.password, admin.password);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const token = signToken({ sub: admin._id.toString(), role: "admin" });

  return {
    token,
    admin: { id: admin._id.toString(), name: admin.name, email: admin.email },
  };
}

export async function listInventory() {
  const items = await InventoryItem.find().sort({ category: 1, name: 1 });
  // Status was previously only computed on update, so the list endpoint
  // returned raw quantity/threshold and left the frontend to work out
  // Healthy/Low Stock/Out of Stock itself — fixed to compute it here too,
  // so admin clients get a single source of truth for stock status.
  return items.map((item) => ({
    ...item.toObject(),
    status: computeStockStatus(item.quantity, item.threshold),
  }));
}

export async function updateInventoryItem(id: string, input: UpdateInventoryInput) {
  const item = await InventoryItem.findByIdAndUpdate(id, input, { new: true });
  if (!item) {
    throw ApiError.notFound("Inventory item not found");
  }
  return {
    ...item.toObject(),
    status: computeStockStatus(item.quantity, item.threshold),
  };
}

export async function listAllOrders() {
  return Order.find().sort({ createdAt: -1 }).populate("user", "name email");
}

export async function getOrderById(id: string) {
  const order = await Order.findById(id).populate("user", "name email");
  if (!order) {
    throw ApiError.notFound("Order not found");
  }
  return order;
}

export function isValidStatusTransition(current: OrderStatus, next: OrderStatus): boolean {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(current);
  const nextIndex = ORDER_STATUS_FLOW.indexOf(next);
  return nextIndex === currentIndex + 1;
}

export async function updateOrderStatus(id: string, nextStatus: OrderStatus) {
  const order = await Order.findById(id);
  if (!order) {
    throw ApiError.notFound("Order not found");
  }

  if (!isValidStatusTransition(order.status, nextStatus)) {
    throw ApiError.badRequest(
      `Cannot move an order from "${order.status}" to "${nextStatus}"`
    );
  }

  order.status = nextStatus;
  order.statusHistory.push({ status: nextStatus, at: new Date() });
  await order.save();
  return order;
}

export async function getSettings() {
  // findOneAndUpdate with upsert ensures the singleton document always
  // exists after the first call, without a separate "create if missing"
  // branch scattered across callers.
  const settings = await Settings.findByIdAndUpdate(
    SETTINGS_ID,
    { $setOnInsert: { _id: SETTINGS_ID } },
    { new: true, upsert: true }
  );
  return settings;
}

export async function updateSettings(input: UpdateSettingsInput) {
  const settings = await Settings.findByIdAndUpdate(
    SETTINGS_ID,
    { $set: input },
    { new: true, upsert: true }
  );
  return settings;
}
