import { Router } from "express";
import { requireAdmin } from "../middleware/requireAdmin";
import { validate } from "../middleware/validate";
import { authLimiter } from "../middleware/rateLimit";
import {
  adminLoginSchema,
  updateInventorySchema,
  updateOrderStatusSchema,
  updateSettingsSchema,
} from "../validation/admin.schema";
import {
  adminLogin,
  adminLogout,
  getAdminMe,
  getInventory,
  patchInventoryItem,
  getAllOrders,
  getOrder,
  patchOrderStatus,
  getSettings,
  patchSettings,
} from "../controllers/admin.controller";

const router = Router();

// Deliberately no /register route exists on this router — admin
// accounts are provisioned only via the seed script.
router.post("/login", authLimiter, validate({ body: adminLoginSchema }), adminLogin);
router.post("/logout", adminLogout);

router.use(requireAdmin);

router.get("/me", getAdminMe);
router.get("/inventory", getInventory);
router.patch("/inventory/:id", validate({ body: updateInventorySchema }), patchInventoryItem);

router.get("/orders", getAllOrders);
router.get("/orders/:id", getOrder);
router.patch("/orders/:id/status", validate({ body: updateOrderStatusSchema }), patchOrderStatus);

router.get("/settings", getSettings);
router.patch("/settings", validate({ body: updateSettingsSchema }), patchSettings);

export default router;
