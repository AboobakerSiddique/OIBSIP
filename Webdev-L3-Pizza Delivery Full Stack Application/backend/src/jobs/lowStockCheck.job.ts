import cron, { type ScheduledTask } from "node-cron";
import { env } from "../config/env";
import { runLowStockCheck } from "../services/lowStock.service";

let task: ScheduledTask | null = null;

export function startLowStockCronJob(): void {
  if (task) return; // already running — don't double-schedule

  if (!cron.validate(env.LOW_STOCK_CRON_SCHEDULE)) {
    // eslint-disable-next-line no-console
    console.error(
      `[cron] Invalid LOW_STOCK_CRON_SCHEDULE "${env.LOW_STOCK_CRON_SCHEDULE}" — low-stock checks are disabled.`
    );
    return;
  }

  task = cron.schedule(env.LOW_STOCK_CRON_SCHEDULE, async () => {
    try {
      const result = await runLowStockCheck();
      // eslint-disable-next-line no-console
      console.log("[cron] Low-stock check:", result);
    } catch (err) {
      // A failed check should never crash the process — log and let
      // the next scheduled run try again.
      // eslint-disable-next-line no-console
      console.error("[cron] Low-stock check failed:", err);
    }
  });

  // eslint-disable-next-line no-console
  console.log(`[cron] Low-stock check scheduled: "${env.LOW_STOCK_CRON_SCHEDULE}"`);
}

export function stopLowStockCronJob(): void {
  task?.stop();
  task = null;
}
