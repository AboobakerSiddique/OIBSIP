import { Schema, model, type Document, type Types } from "mongoose";

export interface AdminDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<AdminDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

adminSchema.index({ email: 1 }, { unique: true });

// Deliberately no public registration route exists for this model.
// Admin accounts are created only via the seed script or direct DB access.
export const Admin = model<AdminDocument>("Admin", adminSchema);
export default Admin;
