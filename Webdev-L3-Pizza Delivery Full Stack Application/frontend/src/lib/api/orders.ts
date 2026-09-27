import { apiClient } from "../apiClient";
import type { DraftItem } from "../OrderDraftContext";
import type { Order } from "../../types/domain";

export interface CheckoutItemInput {
  pizza?: string;
  label: string;
  baseId?: string;
  sauceId?: string;
  cheeseId?: string;
  vegetableIds?: string[];
  quantity: number;
}

export function draftItemsToCheckoutInput(items: DraftItem[]): CheckoutItemInput[] {
  return items.map((item) => ({
    pizza: item.pizzaId,
    label: item.label,
    baseId: item.baseId,
    sauceId: item.sauceId,
    cheeseId: item.cheeseId,
    vegetableIds: item.vegetableIds ?? [],
    quantity: item.quantity,
  }));
}

export interface CheckoutSession {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  totalAmount: number;
}

export async function initiateCheckout(items: CheckoutItemInput[]): Promise<CheckoutSession> {
  const res = await apiClient.post<{ data: CheckoutSession }>("/orders/checkout", { items });
  return res.data;
}

export interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface CreatedOrder {
  _id: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
}

export async function verifyPayment(
  items: CheckoutItemInput[],
  payment: RazorpayPaymentResponse
): Promise<CreatedOrder> {
  const res = await apiClient.post<{ data: CreatedOrder }>("/orders/verify", {
    items,
    ...payment,
  });
  return res.data;
}

// --- Order listing / tracking -------------------------------------------

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
  user?: { name: string; email: string } | string;
}

function mapOrder(o: ApiOrder): Order {
  return {
    id: o._id,
    placedAt: o.createdAt,
    status: o.status,
    paymentStatus: o.paymentStatus,
    total: o.totalAmount,
    statusHistory: o.statusHistory ?? [],
    customer:
      o.user && typeof o.user === "object" ? { name: o.user.name, email: o.user.email } : undefined,
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

export async function fetchMyOrders(): Promise<Order[]> {
  const res = await apiClient.get<{ data: ApiOrder[] }>("/orders");
  return res.data.map(mapOrder);
}

export async function fetchMyOrderById(id: string): Promise<Order> {
  const res = await apiClient.get<{ data: ApiOrder }>(`/orders/${id}`);
  return mapOrder(res.data);
}
