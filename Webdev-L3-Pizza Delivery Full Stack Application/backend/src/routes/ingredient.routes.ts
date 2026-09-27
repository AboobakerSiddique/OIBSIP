import { Router } from "express";
import { getIngredients } from "../controllers/ingredient.controller";

const router = Router();

router.get("/", getIngredients);

export default router;
