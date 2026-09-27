import { Schema, model, type Document, type Types } from "mongoose";

export interface VerificationTokenDocument extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

const verificationTokenSchema = new Schema<VerificationTokenDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// MongoDB TTL index — the document is automatically deleted once expired.
verificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
verificationTokenSchema.index({ user: 1 });

export const VerificationToken = model<VerificationTokenDocument>(
  "VerificationToken",
  verificationTokenSchema
);
export default VerificationToken;
