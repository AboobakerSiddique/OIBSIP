/**
 * Decides whether a fresh low-stock alert should be sent for an item,
 * given when it was last notified. Pure function — the cron job feeds
 * it real timestamps, tests feed it fixed ones.
 */
export function shouldSendAlert(
  lastNotifiedAt: Date | null,
  cooldownHours: number,
  now: Date = new Date()
): boolean {
  if (!lastNotifiedAt) return true;
  const elapsedMs = now.getTime() - lastNotifiedAt.getTime();
  const cooldownMs = cooldownHours * 60 * 60 * 1000;
  return elapsedMs >= cooldownMs;
}
