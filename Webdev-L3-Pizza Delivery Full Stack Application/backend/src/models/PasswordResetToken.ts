import { Schema, model, type Document, type Types } from "mongoose";

export interface PasswordResetTokenDocument extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

const passwordResetTokenSchema = new Schema<PasswordResetTokenDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
passwordResetTokenSchema.index({ user: 1 });

export const PasswordResetToken = model<PasswordResetTokenDocument>(
  "PasswordResetToken",
  passwordResetTokenSchema
);
export default PasswordResetToken;
