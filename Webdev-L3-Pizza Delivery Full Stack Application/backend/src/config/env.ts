import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    // In Phase 0 we warn instead of throwing so the foundation can boot
    // without every downstream secret (JWT, Razorpay, SMTP) being present yet.
    // eslint-disable-next-line no-console
    console.warn(`[env] Missing environment variable: ${name}`);
    return "";
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 5000),
  MONGODB_URI: process.env.MONGODB_URI ?? "",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:5173",

  // Reserved for later phases — read here now so all env access is centralized.
  JWT_SECRET: process.env.JWT_SECRET ?? "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ?? "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ?? "",
  SMTP_HOST: process.env.SMTP_HOST ?? "",
  SMTP_PORT: Number(process.env.SMTP_PORT ?? 587),
  SMTP_USER: process.env.SMTP_USER ?? "",
  SMTP_PASS: process.env.SMTP_PASS ?? "",
  EMAIL_FROM: process.env.EMAIL_FROM ?? "Bella Pizza <no-reply@bellapizza.test>",

  // Used to build links inside emails (verify-email, reset-password).
  FRONTEND_URL: process.env.FRONTEND_URL ?? process.env.CORS_ORIGIN ?? "http://localhost:5173",

  // Low-stock notification job (Phase 8)
  LOW_STOCK_CRON_SCHEDULE: process.env.LOW_STOCK_CRON_SCHEDULE ?? "0 * * * *", // hourly by default
  LOW_STOCK_NOTIFICATION_COOLDOWN_HOURS: Number(
    process.env.LOW_STOCK_NOTIFICATION_COOLDOWN_HOURS ?? 24
  ),
  ADMIN_ALERT_EMAIL: process.env.ADMIN_ALERT_EMAIL ?? "",
};

export { required };
export default env;
