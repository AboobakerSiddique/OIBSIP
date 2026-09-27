import { Schema, model, type Document, type Types } from "mongoose";

export interface LowStockNotificationDocument extends Document {
  _id: Types.ObjectId;
  inventoryItem: Types.ObjectId;
  lastNotifiedAt: Date;
}

const lowStockNotificationSchema = new Schema<LowStockNotificationDocument>({
  inventoryItem: {
    type: Schema.Types.ObjectId,
    ref: "InventoryItem",
    required: true,
    unique: true,
  },
  lastNotifiedAt: { type: Date, required: true },
});

export const LowStockNotification = model<LowStockNotificationDocument>(
  "LowStockNotification",
  lowStockNotificationSchema
);
export default LowStockNotification;
