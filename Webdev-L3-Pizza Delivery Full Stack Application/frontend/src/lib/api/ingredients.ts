import { apiClient } from "../apiClient";
import type { IngredientOption } from "../../types/domain";

interface IngredientsResponse {
  success: boolean;
  data: {
    "Pizza Bases": IngredientOption[];
    Sauces: IngredientOption[];
    Cheeses: IngredientOption[];
    Vegetables: IngredientOption[];
  };
}

export interface IngredientCatalog {
  bases: IngredientOption[];
  sauces: IngredientOption[];
  cheeses: IngredientOption[];
  vegetables: IngredientOption[];
}

export async function fetchIngredientCatalog(): Promise<IngredientCatalog> {
  const res = await apiClient.get<IngredientsResponse>("/ingredients");
  return {
    bases: res.data["Pizza Bases"] ?? [],
    sauces: res.data.Sauces ?? [],
    cheeses: res.data.Cheeses ?? [],
    vegetables: res.data.Vegetables ?? [],
  };
}
