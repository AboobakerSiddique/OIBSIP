import crypto from "crypto";

/**
 * Generates a random token to send to the user (via email in Phase 8),
 * and a SHA-256 hash of it to store in the database. Only the hash is
 * ever persisted, so a database read alone can't be used to impersonate
 * the token holder.
 */
export function generateOneTimeToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  return { token, tokenHash };
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
