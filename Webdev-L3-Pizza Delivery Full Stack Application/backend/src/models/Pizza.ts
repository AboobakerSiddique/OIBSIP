import { Schema, model, type Document, type Types } from "mongoose";

export type PizzaCategory = "Classic" | "Signature" | "Vegetarian";

export interface PizzaDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  category: PizzaCategory;
  toppings: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pizzaSchema = new Schema<PizzaDocument>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ["Classic", "Signature", "Vegetarian"],
    },
    toppings: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

pizzaSchema.index({ category: 1 });

export const Pizza = model<PizzaDocument>("Pizza", pizzaSchema);
export default Pizza;
