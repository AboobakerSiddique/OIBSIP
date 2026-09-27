import { InventoryItem } from "../models/InventoryItem";
import { LowStockNotification } from "../models/LowStockNotification";
import { Settings, SETTINGS_ID } from "../models/Settings";
import { Admin } from "../models/Admin";
import { computeStockStatus } from "../utils/stockStatus";
import { shouldSendAlert } from "../utils/notificationCooldown";
import { sendLowStockAlert, type LowStockAlertItem } from "./email.service";
import { env } from "../config/env";

async function resolveNotifyEmail(): Promise<string | null> {
  const settings = await Settings.findById(SETTINGS_ID);
  if (settings?.notifyEmail) return settings.notifyEmail;
  if (env.ADMIN_ALERT_EMAIL) return env.ADMIN_ALERT_EMAIL;

  // Last-resort fallback: notify whichever admin account exists, so a
  // fresh install with no settings configured still alerts someone
  // rather than silently doing nothing.
  const admin = await Admin.findOne().sort({ createdAt: 1 });
  return admin?.email ?? null;
}

export interface LowStockCheckResult {
  checked: number;
  lowStockCount: number;
  alertedCount: number;
  emailSent: boolean;
  skippedReason?: string;
}

/**
 * Runs one low-stock check cycle:
 *   1. Find every item currently at or below its threshold.
 *   2. Clear notification tracking for items that have since recovered
 *      (so a future dip alerts fresh, not still "on cooldown" from an
 *      old, unrelated shortage).
 *   3. Of the currently-low items, only alert on the ones outside their
 *      cooldown window — this is what actually prevents spamming the
 *      same alert every single cron cycle.
 *   4. Send one combined email (not one per item) and stamp
 *      lastNotifiedAt for everything just alerted on.
 */
export async function runLowStockCheck(): Promise<LowStockCheckResult> {
  const items = await InventoryItem.find({ isActive: true });
  const lowStockItems = items.filter(
    (item) => computeStockStatus(item.quantity, item.threshold) !== "Healthy"
  );
  const lowStockIds = lowStockItems.map((i) => i._id);

  // Recovered items no longer need a cooldown record — remove it so
  // the next time they dip low, it's treated as a fresh condition.
  await LowStockNotification.deleteMany({ inventoryItem: { $nin: lowStockIds } });

  if (lowStockItems.length === 0) {
    return { checked: items.length, lowStockCount: 0, alertedCount: 0, emailSent: false };
  }

  const trackingDocs = await LowStockNotification.find({ inventoryItem: { $in: lowStockIds } });
  const lastNotifiedById = new Map(
    trackingDocs.map((d) => [d.inventoryItem.toString(), d.lastNotifiedAt])
  );

  const now = new Date();
  const dueForAlert = lowStockItems.filter((item) =>
    shouldSendAlert(
      lastNotifiedById.get(item._id.toString()) ?? null,
      env.LOW_STOCK_NOTIFICATION_COOLDOWN_HOURS,
      now
    )
  );

  if (dueForAlert.length === 0) {
    return {
      checked: items.length,
      lowStockCount: lowStockItems.length,
      alertedCount: 0,
      emailSent: false,
      skippedReason: "All low-stock items are within their notification cooldown window",
    };
  }

  const notifyEmail = await resolveNotifyEmail();
  if (!notifyEmail) {
    return {
      checked: items.length,
      lowStockCount: lowStockItems.length,
      alertedCount: 0,
      emailSent: false,
      skippedReason: "No notification recipient configured (Settings.notifyEmail, ADMIN_ALERT_EMAIL, or an Admin account)",
    };
  }

  const alertPayload: LowStockAlertItem[] = dueForAlert.map((item) => ({
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    threshold: item.threshold,
    unit: item.unit,
  }));

  const result = await sendLowStockAlert(notifyEmail, alertPayload);

  await Promise.all(
    dueForAlert.map((item) =>
      LowStockNotification.findOneAndUpdate(
        { inventoryItem: item._id },
        { inventoryItem: item._id, lastNotifiedAt: now },
        { upsert: true }
      )
    )
  );

  return {
    checked: items.length,
    lowStockCount: lowStockItems.length,
    alertedCount: dueForAlert.length,
    emailSent: result.sent,
  };
}
