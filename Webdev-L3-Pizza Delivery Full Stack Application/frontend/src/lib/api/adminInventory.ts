import { apiClient } from "../apiClient";
import type { InventoryItem } from "../../types/domain";

interface ApiInventoryItem {
  _id: string;
  name: string;
  category: InventoryItem["category"];
  quantity: number;
  threshold: number;
  unit: string;
  addOnPrice: number;
  isActive: boolean;
  status: InventoryItem["status"];
  updatedAt: string;
}

function mapItem(i: ApiInventoryItem): InventoryItem {
  return {
    id: i._id,
    name: i.name,
    category: i.category,
    quantity: i.quantity,
    threshold: i.threshold,
    unit: i.unit,
    status: i.status,
    updatedAt: i.updatedAt,
  };
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  const res = await apiClient.get<{ data: ApiInventoryItem[] }>("/admin/inventory");
  return res.data.map(mapItem);
}

export async function updateInventoryItem(
  id: string,
  patch: { quantity?: number; threshold?: number }
): Promise<InventoryItem> {
  const res = await apiClient.patch<{ data: ApiInventoryItem }>(`/admin/inventory/${id}`, patch);
  return mapItem(res.data);
}
