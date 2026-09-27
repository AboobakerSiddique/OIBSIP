export interface Pizza {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "Classic" | "Signature" | "Vegetarian";
  toppings: string[];
}

export interface IngredientOption {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  label: string;
  base: string;
  sauce: string;
  cheese: string;
  vegetables: string[];
  quantity: number;
  price: number;
}

export interface StatusHistoryEntry {
  status: "Order Received" | "In Kitchen" | "Sent to Delivery";
  at: string;
}

export interface Order {
  id: string;
  placedAt: string;
  status: "Order Received" | "In Kitchen" | "Sent to Delivery";
  items: OrderItem[];
  total: number;
  paymentStatus: "Paid" | "Failed" | "Pending";
  statusHistory: StatusHistoryEntry[];
  // Present only on admin-facing order responses (populated from the
  // Order's user reference).
  customer?: { name: string; email: string };
}

export interface InventoryItem {
  id: string;
  name: string;
  category: "Pizza Bases" | "Sauces" | "Cheeses" | "Vegetables";
  quantity: number;
  threshold: number;
  unit: string;
  status: "Healthy" | "Low Stock" | "Out of Stock";
  updatedAt: string;
}
