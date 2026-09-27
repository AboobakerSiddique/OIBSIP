import { Router } from "express";
import { getPizzas, getPizza } from "../controllers/pizza.controller";

const router = Router();

router.get("/", getPizzas);
router.get("/:id", getPizza);

export default router;
