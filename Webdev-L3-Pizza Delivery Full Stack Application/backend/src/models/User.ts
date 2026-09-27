import { Schema, model, type Document, type Types } from "mongoose";

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
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
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

export const User = model<UserDocument>("User", userSchema);
export default User;
