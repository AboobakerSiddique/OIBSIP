import request from "supertest";
import { createApp } from "../src/app";

const app = createApp();

describe("auth rate limiting", () => {
  it("returns 429 after exceeding the login attempt limit", async () => {
    const attempt = () =>
      request(app).post("/api/auth/login").send({ email: "nope", password: "x" });

    // The limiter's max is 10 per window; the first 10 requests should
    // each fail normal validation (400) — this proves the limiter runs
    // regardless of what happens downstream (it's positioned before
    // validate() in the route chain). The 11th must be blocked by the
    // limiter itself before reaching validation.
    let lastStatus = 0;
    for (let i = 0; i < 10; i++) {
      const res = await attempt();
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(400); // still under the limit

    const eleventh = await attempt();
    expect(eleventh.status).toBe(429);
    expect(eleventh.body.success).toBe(false);
  }, 15000);
});
