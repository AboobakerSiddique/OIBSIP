import { isValidStatusTransition } from "../src/services/admin.service";

describe("isValidStatusTransition", () => {
  it("allows Order Received -> In Kitchen", () => {
    expect(isValidStatusTransition("Order Received", "In Kitchen")).toBe(true);
  });

  it("allows In Kitchen -> Sent to Delivery", () => {
    expect(isValidStatusTransition("In Kitchen", "Sent to Delivery")).toBe(true);
  });

  it("rejects skipping a stage", () => {
    expect(isValidStatusTransition("Order Received", "Sent to Delivery")).toBe(false);
  });

  it("rejects moving backward", () => {
    expect(isValidStatusTransition("In Kitchen", "Order Received")).toBe(false);
  });

  it("rejects a no-op transition to the same status", () => {
    expect(isValidStatusTransition("Order Received", "Order Received")).toBe(false);
  });

  it("rejects any transition once delivered", () => {
    expect(isValidStatusTransition("Sent to Delivery", "In Kitchen")).toBe(false);
  });
});
