export type OrderStatus = "Order Received" | "In Kitchen" | "Sent to Delivery";
export type StockStatus = "Healthy" | "Low Stock" | "Out of Stock";

const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  "Order Received": "status-badge--received",
  "In Kitchen": "status-badge--kitchen",
  "Sent to Delivery": "status-badge--delivery",
};

const STOCK_STATUS_CLASS: Record<StockStatus, string> = {
  Healthy: "status-badge--healthy",
  "Low Stock": "status-badge--low",
  "Out of Stock": "status-badge--out",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`status-badge ${ORDER_STATUS_CLASS[status]}`}>{status}</span>;
}

export function StockStatusBadge({ status }: { status: StockStatus }) {
  return <span className={`status-badge ${STOCK_STATUS_CLASS[status]}`}>{status}</span>;
}
