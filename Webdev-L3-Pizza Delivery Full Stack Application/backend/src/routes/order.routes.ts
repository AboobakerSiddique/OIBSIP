import { Router } from "express";
import { requireUser } from "../middleware/requireUser";
import { validate } from "../middleware/validate";
import { createOrderSchema, verifyPaymentSchema } from "../validation/order.schema";
import { checkout, verifyPayment, listMyOrders, getMyOrder } from "../controllers/order.controller";

const router = Router();

router.use(requireUser);

// Order creation is a two-step, payment-gated flow — there is no plain
// "create order" endpoint. /checkout prices the draft and opens a
// Razorpay order; /verify checks the payment actually happened before
// any Order document is written. See order.service.ts for the full
// rationale (this replaces the placeholder POST /api/orders from
// Phase 2, which created unpaid orders directly).
router.post("/checkout", validate({ body: createOrderSchema }), checkout);
router.post("/verify", validate({ body: verifyPaymentSchema }), verifyPayment);

router.get("/", listMyOrders);
router.get("/:id", getMyOrder);

export default router;
