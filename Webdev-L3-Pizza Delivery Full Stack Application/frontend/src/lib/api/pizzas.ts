import { apiClient } from "../apiClient";
import type { Pizza } from "../../types/domain";

interface ApiPizza {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: Pizza["category"];
  toppings: string[];
}

function mapPizza(p: ApiPizza): Pizza {
  return {
    id: p._id,
    name: p.name,
    description: p.description,
    price: p.price,
    category: p.category,
    toppings: p.toppings,
  };
}

export async function fetchPizzas(): Promise<Pizza[]> {
  const res = await apiClient.get<{ success: boolean; data: ApiPizza[] }>("/pizzas");
  return res.data.map(mapPizza);
}

export async function fetchPizzaById(id: string): Promise<Pizza> {
  const res = await apiClient.get<{ success: boolean; data: ApiPizza }>(`/pizzas/${id}`);
  return mapPizza(res.data);
}
