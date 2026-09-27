import { createApp } from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { startLowStockCronJob } from "./jobs/lowStockCheck.job";

/**
 * The HTTP server starts listening immediately rather than waiting on
 * the database connection. This matters because MongoDB connection
 * attempts can be slow (or the DB can be temporarily unreachable) —
 * blocking startup on that would take down /api/health along with
 * everything else. Routes that actually need the database will fail
 * on their own (and are wrapped in asyncHandler + centralized error
 * handling), while health checks and static behavior stay available.
 */
function bootstrap(): void {
  const app = createApp();

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] Bella Pizza API listening on port ${env.PORT} (${env.NODE_ENV})`);
  });

  connectDB().catch((err) => {
    // eslint-disable-next-line no-console
    console.error("[server] Initial database connection attempt failed:", err);
  });

  if (env.NODE_ENV !== "test") {
    startLowStockCronJob();
  }
}

bootstrap();
