import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as pizzaService from "../services/pizza.service";

export const getPizzas = asyncHandler(async (_req: Request, res: Response) => {
  const pizzas = await pizzaService.listPizzas();
  res.status(200).json({ success: true, data: pizzas });
});

export const getPizza = asyncHandler(async (req: Request, res: Response) => {
  const pizza = await pizzaService.getPizzaById(req.params.id as string);
  res.status(200).json({ success: true, data: pizza });
});
