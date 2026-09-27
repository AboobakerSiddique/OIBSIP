import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "./auth.routes";
import pizzaRoutes from "./pizza.routes";
import ingredientRoutes from "./ingredient.routes";
import orderRoutes from "./order.routes";
import adminRoutes from "./admin.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/pizzas", pizzaRoutes);
router.use("/ingredients", ingredientRoutes);
router.use("/orders", orderRoutes);
router.use("/admin", adminRoutes);

export default router;
