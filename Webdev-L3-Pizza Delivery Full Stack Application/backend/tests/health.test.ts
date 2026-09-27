import request from "supertest";
import { createApp } from "../src/app";

describe("GET /api/health", () => {
  const app = createApp();

  it("returns 200 and a success payload", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty("database");
  });

  it("responds even when the database is not connected (no MONGODB_URI configured in tests)", async () => {
    // This test suite never calls connectDB(), so this also guards
    // against server startup being accidentally coupled to the DB
    // connection completing (a real bug found during Phase 4 testing).
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(["connected", "disconnected", "connecting", "disconnecting"]).toContain(
      res.body.database
    );
  });
});

describe("unknown route", () => {
  const app = createApp();

  it("returns 404 via the notFound middleware", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
