import { getEmailTransporter, isEmailConfigured } from "../config/email";
import { env } from "../config/env";

interface SendResult {
  sent: boolean;
  reason?: string;
}

async function safeSend(to: string, subject: string, html: string, text: string): Promise<SendResult> {
  if (!isEmailConfigured()) {
    // eslint-disable-next-line no-console
    console.warn(`[email] SMTP not configured — skipped sending "${subject}" to ${to}`);
    return { sent: false, reason: "SMTP not configured" };
  }

  try {
    const transporter = getEmailTransporter();
    await transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html, text });
    return { sent: true };
  } catch (err) {
    // Email failures should never take down the calling request (e.g.
    // registration should still succeed even if the verification email
    // fails to send) — log and report back, don't throw.
    // eslint-disable-next-line no-console
    console.error(`[email] Failed to send "${subject}" to ${to}:`, err);
    return { sent: false, reason: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<SendResult> {
  const link = `${env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;
  return safeSend(
    to,
    "Verify your Bella Pizza account",
    `<p>Hi ${name},</p><p>Welcome to Bella Pizza. Confirm your email to start ordering:</p><p><a href="${link}">${link}</a></p><p>This link expires in 24 hours.</p>`,
    `Hi ${name},\n\nWelcome to Bella Pizza. Confirm your email to start ordering:\n${link}\n\nThis link expires in 24 hours.`
  );
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string
): Promise<SendResult> {
  const link = `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
  return safeSend(
    to,
    "Reset your Bella Pizza password",
    `<p>Hi ${name},</p><p>Reset your password using the link below:</p><p><a href="${link}">${link}</a></p><p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`,
    `Hi ${name},\n\nReset your password using the link below:\n${link}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.`
  );
}

export interface LowStockAlertItem {
  name: string;
  category: string;
  quantity: number;
  threshold: number;
  unit: string;
}

export async function sendLowStockAlert(
  to: string,
  items: LowStockAlertItem[]
): Promise<SendResult> {
  const rows = items
    .map(
      (i) =>
        `<tr><td>${i.name}</td><td>${i.category}</td><td>${i.quantity} ${i.unit}</td><td>${i.threshold} ${i.unit}</td></tr>`
    )
    .join("");
  const lines = items
    .map((i) => `- ${i.name} (${i.category}): ${i.quantity}${i.unit} remaining, threshold ${i.threshold}${i.unit}`)
    .join("\n");

  return safeSend(
    to,
    `Bella Pizza: ${items.length} item(s) low on stock`,
    `<p>The following inventory items need attention:</p><table border="1" cellpadding="6" style="border-collapse:collapse"><tr><th>Item</th><th>Category</th><th>Quantity</th><th>Threshold</th></tr>${rows}</table>`,
    `The following inventory items need attention:\n\n${lines}`
  );
}
