import { Schema, model, type Document, type Types } from "mongoose";

export type InventoryCategory =
  | "Pizza Bases"
  | "Sauces"
  | "Cheeses"
  | "Vegetables";

export interface InventoryItemDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  category: InventoryCategory;
  quantity: number;
  threshold: number;
  unit: string;
  /**
   * Extra charge applied when a customer selects this ingredient in the
   * custom pizza builder. Not part of the spec's minimal field list, but
   * required for the builder (Phase 4) to compute a live price — this
   * item doubles as both the stock ledger and the buildable ingredient
   * catalog rather than introducing a separate model.
   */
  addOnPrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const inventoryItemSchema = new Schema<InventoryItemDocument>(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Pizza Bases", "Sauces", "Cheeses", "Vegetables"],
    },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    threshold: { type: Number, required: true, min: 0, default: 10 },
    unit: { type: String, required: true, trim: true, default: "units" },
    addOnPrice: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

inventoryItemSchema.index({ category: 1, isActive: 1 });
inventoryItemSchema.index({ name: 1, category: 1 }, { unique: true });

export const InventoryItem = model<InventoryItemDocument>(
  "InventoryItem",
  inventoryItemSchema
);
export default InventoryItem;
