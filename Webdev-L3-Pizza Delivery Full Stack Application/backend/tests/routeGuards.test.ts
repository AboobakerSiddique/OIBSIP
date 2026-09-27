import request from "supertest";
import { createApp } from "../src/app";

const app = createApp();

describe("auth guards (no DB required — requests are rejected before any query)", () => {
  it("rejects checkout with no token", async () => {
    const res = await request(app).post("/api/orders/checkout").send({ items: [] });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects payment verification with no token", async () => {
    const res = await request(app).post("/api/orders/verify").send({});
    expect(res.status).toBe(401);
  });

  it("rejects listing orders with no token", async () => {
    const res = await request(app).get("/api/orders");
    expect(res.status).toBe(401);
  });

  it("rejects a malformed bearer token", async () => {
    const res = await request(app)
      .get("/api/orders")
      .set("Authorization", "Bearer not-a-real-jwt");
    expect(res.status).toBe(401);
  });

  it("rejects an expired user token", async () => {
    const jwt = require("jsonwebtoken");
    const expiredToken = jwt.sign(
      { sub: "someuser", role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: -10 } // already expired 10 seconds ago
    );
    const res = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
  });

  it("rejects an expired admin token", async () => {
    const jwt = require("jsonwebtoken");
    const expiredToken = jwt.sign(
      { sub: "someadmin", role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: -10 }
    );
    const res = await request(app)
      .get("/api/admin/inventory")
      .set("Authorization", `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
  });

  it("rejects a token signed with the wrong secret (tampered/forged)", async () => {
    const jwt = require("jsonwebtoken");
    const forgedToken = jwt.sign({ sub: "someuser", role: "user" }, "wrong-secret-entirely");
    const res = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${forgedToken}`);
    expect(res.status).toBe(401);
  });

  it("rejects admin inventory access with no token", async () => {
    const res = await request(app).get("/api/admin/inventory");
    expect(res.status).toBe(401);
  });

  it("rejects admin order-status updates with no token", async () => {
    const res = await request(app)
      .patch("/api/admin/orders/507f1f77bcf86cd799439011/status")
      .send({ status: "In Kitchen" });
    expect(res.status).toBe(401);
  });

  it("rejects GET /api/auth/me with no token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("rejects GET /api/admin/me with no token", async () => {
    const res = await request(app).get("/api/admin/me");
    expect(res.status).toBe(401);
  });

  it("rejects a user-role token on an admin route", async () => {
    // Sign a user-role token using the same secret the app expects, then
    // confirm requireAdmin refuses it even though it's otherwise valid.
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ sub: "someuser", role: "user" }, process.env.JWT_SECRET);
    const res = await request(app)
      .get("/api/admin/inventory")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("rejects an admin-role token on a user route", async () => {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ sub: "someadmin", role: "admin" }, process.env.JWT_SECRET);
    const res = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});

describe("input validation (rejected before reaching the database)", () => {
  it("rejects registration with an invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test", email: "not-an-email", password: "password123" });
    expect(res.status).toBe(400);
  });

  it("rejects registration with a short password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test", email: "test@example.com", password: "short" });
    expect(res.status).toBe(400);
  });

  it("rejects registration with a missing name", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", password: "password123" });
    expect(res.status).toBe(400);
  });

  it("rejects login with a malformed email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nope", password: "password123" });
    expect(res.status).toBe(400);
  });

  it("rejects checkout with an empty items array", async () => {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ sub: "someuser", role: "user" }, process.env.JWT_SECRET);
    const res = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [] });
    expect(res.status).toBe(400);
  });

  it("rejects a custom-build item missing baseId/sauceId/cheeseId", async () => {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ sub: "someuser", role: "user" }, process.env.JWT_SECRET);
    const res = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [{ label: "Custom Build", quantity: 1 }] });
    expect(res.status).toBe(400);
  });

  it("rejects payment verification with a missing signature field", async () => {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ sub: "someuser", role: "user" }, process.env.JWT_SECRET);
    const res = await request(app)
      .post("/api/orders/verify")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [{ pizza: "507f1f77bcf86cd799439011", label: "Margherita", quantity: 1 }],
        razorpay_order_id: "order_123",
        razorpay_payment_id: "pay_123",
        // razorpay_signature intentionally omitted
      });
    expect(res.status).toBe(400);
  });

  it("rejects an admin order-status update with an invalid status value", async () => {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ sub: "someadmin", role: "admin" }, process.env.JWT_SECRET);
    const res = await request(app)
      .patch("/api/admin/orders/507f1f77bcf86cd799439011/status")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "Delivered By Drone" });
    expect(res.status).toBe(400);
  });
});
