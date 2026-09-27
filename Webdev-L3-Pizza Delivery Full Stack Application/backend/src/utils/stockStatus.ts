export type StockStatus = "Healthy" | "Low Stock" | "Out of Stock";

export function computeStockStatus(quantity: number, threshold: number): StockStatus {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= threshold) return "Low Stock";
  return "Healthy";
}
