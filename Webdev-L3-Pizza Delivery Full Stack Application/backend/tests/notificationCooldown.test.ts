import { shouldSendAlert } from "../src/utils/notificationCooldown";

describe("shouldSendAlert", () => {
  it("sends an alert when there is no prior notification", () => {
    expect(shouldSendAlert(null, 24)).toBe(true);
  });

  it("does not send again immediately after a notification", () => {
    const now = new Date("2026-01-02T12:00:00Z");
    const lastNotifiedAt = new Date("2026-01-02T11:59:00Z");
    expect(shouldSendAlert(lastNotifiedAt, 24, now)).toBe(false);
  });

  it("does not send while still within the cooldown window", () => {
    const now = new Date("2026-01-02T12:00:00Z");
    const lastNotifiedAt = new Date("2026-01-02T00:00:01Z"); // ~12h ago, cooldown 24h
    expect(shouldSendAlert(lastNotifiedAt, 24, now)).toBe(false);
  });

  it("sends again once the cooldown window has fully elapsed", () => {
    const now = new Date("2026-01-03T12:00:00Z");
    const lastNotifiedAt = new Date("2026-01-02T12:00:00Z"); // exactly 24h ago
    expect(shouldSendAlert(lastNotifiedAt, 24, now)).toBe(true);
  });

  it("sends again just after the cooldown window elapses", () => {
    const now = new Date("2026-01-03T12:00:01Z");
    const lastNotifiedAt = new Date("2026-01-02T12:00:00Z");
    expect(shouldSendAlert(lastNotifiedAt, 24, now)).toBe(true);
  });

  it("respects a shorter configured cooldown", () => {
    const now = new Date("2026-01-02T02:00:00Z");
    const lastNotifiedAt = new Date("2026-01-02T00:00:00Z");
    expect(shouldSendAlert(lastNotifiedAt, 1, now)).toBe(true); // 2h elapsed, 1h cooldown
  });
});
