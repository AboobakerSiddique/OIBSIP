import { apiClient } from "../apiClient";
import type { Order } from "../../types/domain";

interface ApiIngredientSnapshot {
  name: string;
  price: number;
}

interface ApiOrderItem {
  _id: string;
  label: string;
  base: ApiIngredientSnapshot;
  sauce: ApiIngredientSnapshot;
  cheese: ApiIngredientSnapshot;
  vegetables: ApiIngredientSnapshot[];
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface ApiOrder {
  _id: string;
  createdAt: string;
  status: Order["status"];
  paymentStatus: Order["paymentStatus"];
  totalAmount: number;
  items: ApiOrderItem[];
  statusHistory: { status: Order["status"]; at: string }[];
  user: { name: string; email: string } | string;
}

function mapOrder(o: ApiOrder): Order {
  return {
    id: o._id,
    placedAt: o.createdAt,
    status: o.status,
    paymentStatus: o.paymentStatus,
    total: o.totalAmount,
    statusHistory: o.statusHistory ?? [],
    customer: typeof o.user === "object" ? { name: o.user.name, email: o.user.email } : undefined,
    items: o.items.map((item) => ({
      id: item._id,
      label: item.label,
      base: item.base.name,
      sauce: item.sauce.name,
      cheese: item.cheese.name,
      vegetables: item.vegetables.map((v) => v.name),
      quantity: item.quantity,
      price: item.lineTotal,
    })),
  };
}

export async function fetchAllOrders(): Promise<Order[]> {
  const res = await apiClient.get<{ data: ApiOrder[] }>("/admin/orders");
  return res.data.map(mapOrder);
}

export async function fetchAdminOrder(id: string): Promise<Order> {
  const res = await apiClient.get<{ data: ApiOrder }>(`/admin/orders/${id}`);
  return mapOrder(res.data);
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<Order> {
  const res = await apiClient.patch<{ data: ApiOrder }>(`/admin/orders/${id}/status`, { status });
  return mapOrder(res.data);
}
