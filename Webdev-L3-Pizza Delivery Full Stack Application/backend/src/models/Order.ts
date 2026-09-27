import { Schema, model, type Document, type Types } from "mongoose";

export type OrderStatus = "Order Received" | "In Kitchen" | "Sent to Delivery";
export type PaymentStatus = "Pending" | "Paid" | "Failed";

/**
 * Snapshot of a selected ingredient at order time — stores both the
 * reference (for reporting/joins) and a name/price snapshot, so the
 * order remains accurate even if the ingredient is later renamed,
 * repriced, or deactivated.
 */
export interface IngredientSnapshot {
  item?: Types.ObjectId;
  name: string;
  price: number;
}

export interface OrderItem {
  pizza?: Types.ObjectId;
  label: string;
  base: IngredientSnapshot;
  sauce: IngredientSnapshot;
  cheese: IngredientSnapshot;
  vegetables: IngredientSnapshot[];
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  at: Date;
}

export interface OrderDocument extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ingredientSnapshotSchema = new Schema<IngredientSnapshot>(
  {
    item: { type: Schema.Types.ObjectId, ref: "InventoryItem" },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderItemSchema = new Schema<OrderItem>(
  {
    pizza: { type: Schema.Types.ObjectId, ref: "Pizza" },
    label: { type: String, required: true },
    base: { type: ingredientSnapshotSchema, required: true },
    sauce: { type: ingredientSnapshotSchema, required: true },
    cheese: { type: ingredientSnapshotSchema, required: true },
    vegetables: { type: [ingredientSnapshotSchema], default: [] },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const statusHistoryEntrySchema = new Schema<StatusHistoryEntry>(
  {
    status: {
      type: String,
      required: true,
      enum: ["Order Received", "In Kitchen", "Sent to Delivery"],
    },
    at: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new Schema<OrderDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true, validate: (v: OrderItem[]) => v.length > 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    status: {
      type: String,
      enum: ["Order Received", "In Kitchen", "Sent to Delivery"],
      default: "Order Received",
    },
    // Per-stage timestamps for the order tracker — populated with the
    // initial "Order Received" entry at creation, then appended to each
    // time an admin advances the status (see admin.service.updateOrderStatus).
    statusHistory: {
      type: [statusHistoryEntrySchema],
      default: () => [{ status: "Order Received", at: new Date() }],
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true });

export const Order = model<OrderDocument>("Order", orderSchema);
export default Order;
