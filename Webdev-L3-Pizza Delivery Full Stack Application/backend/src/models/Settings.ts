import { Schema, model, type Document } from "mongoose";

// Fixed id so there is always exactly one settings document — simpler
// than a full settings collection for a single admin-configurable record.
export const SETTINGS_ID = "app-settings";

export interface SettingsDocument extends Document<string> {
  _id: string;
  notifyEmail: string;
  defaultThreshold: number;
  updatedAt: Date;
}

const settingsSchema = new Schema<SettingsDocument>(
  {
    _id: { type: String, default: SETTINGS_ID },
    notifyEmail: { type: String, default: "" },
    defaultThreshold: { type: Number, default: 10, min: 0 },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const Settings = model<SettingsDocument>("Settings", settingsSchema);
export default Settings;
