import crypto from "crypto";

export interface RazorpayPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Verifies that a payment response actually came from Razorpay by
 * recomputing the expected HMAC-SHA256 signature server-side and
 * comparing it in constant time. This is the entire reason order
 * creation happens *after* this check — a client claiming "payment
 * succeeded" is never sufficient on its own.
 */
export function verifyRazorpaySignature(
  payload: RazorpayPaymentPayload,
  keySecret: string
): boolean {
  const body = `${payload.razorpay_order_id}|${payload.razorpay_payment_id}`;
  const expected = crypto.createHmac("sha256", keySecret).update(body).digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(payload.razorpay_signature, "hex");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}
