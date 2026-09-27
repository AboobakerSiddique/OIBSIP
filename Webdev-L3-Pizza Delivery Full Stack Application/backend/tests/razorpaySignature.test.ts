import crypto from "crypto";
import { verifyRazorpaySignature } from "../src/utils/razorpaySignature";

const KEY_SECRET = "test_secret_key";

function signPayload(orderId: string, paymentId: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

describe("verifyRazorpaySignature", () => {
  it("accepts a correctly signed payload", () => {
    const orderId = "order_abc123";
    const paymentId = "pay_xyz789";
    const signature = signPayload(orderId, paymentId, KEY_SECRET);

    const result = verifyRazorpaySignature(
      {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      },
      KEY_SECRET
    );

    expect(result).toBe(true);
  });

  it("rejects a payload signed with the wrong secret", () => {
    const orderId = "order_abc123";
    const paymentId = "pay_xyz789";
    const signature = signPayload(orderId, paymentId, "wrong_secret");

    const result = verifyRazorpaySignature(
      {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      },
      KEY_SECRET
    );

    expect(result).toBe(false);
  });

  it("rejects a tampered order id (signature no longer matches)", () => {
    const signature = signPayload("order_abc123", "pay_xyz789", KEY_SECRET);

    const result = verifyRazorpaySignature(
      {
        razorpay_order_id: "order_DIFFERENT",
        razorpay_payment_id: "pay_xyz789",
        razorpay_signature: signature,
      },
      KEY_SECRET
    );

    expect(result).toBe(false);
  });

  it("rejects a garbage/malformed signature without throwing", () => {
    const result = verifyRazorpaySignature(
      {
        razorpay_order_id: "order_abc123",
        razorpay_payment_id: "pay_xyz789",
        razorpay_signature: "not-valid-hex-!!",
      },
      KEY_SECRET
    );

    expect(result).toBe(false);
  });

  it("rejects an empty signature", () => {
    const result = verifyRazorpaySignature(
      {
        razorpay_order_id: "order_abc123",
        razorpay_payment_id: "pay_xyz789",
        razorpay_signature: "",
      },
      KEY_SECRET
    );

    expect(result).toBe(false);
  });
});
