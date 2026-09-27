import { InventoryItem } from "../models/InventoryItem";

/**
 * Public-facing ingredient catalog for the custom pizza builder.
 * Deliberately exposes only what the builder needs (id, name, category,
 * price) — never quantity/threshold, which are admin-only inventory
 * details returned by the /api/admin/inventory endpoints instead.
 */
export async function listBuildableIngredients() {
  const items = await InventoryItem.find({ isActive: true, quantity: { $gt: 0 } }).sort({
    category: 1,
    name: 1,
  });

  const grouped: Record<string, Array<{ id: string; name: string; price: number }>> = {
    "Pizza Bases": [],
    Sauces: [],
    Cheeses: [],
    Vegetables: [],
  };

  for (const item of items) {
    grouped[item.category]?.push({
      id: item._id.toString(),
      name: item.name,
      price: item.addOnPrice,
    });
  }

  return grouped;
}
