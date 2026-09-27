import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as ingredientService from "../services/ingredient.service";

export const getIngredients = asyncHandler(async (_req: Request, res: Response) => {
  const ingredients = await ingredientService.listBuildableIngredients();
  res.status(200).json({ success: true, data: ingredients });
});
