import { Pizza } from "../models/Pizza";
import { ApiError } from "../utils/ApiError";

export async function listPizzas() {
  return Pizza.find({ isActive: true }).sort({ category: 1, name: 1 });
}

export async function getPizzaById(id: string) {
  const pizza = await Pizza.findOne({ _id: id, isActive: true });
  if (!pizza) {
    throw ApiError.notFound("Pizza not found");
  }
  return pizza;
}
