import { Link } from "react-router-dom";
import type { Order } from "../../types/domain";
import { OrderStatusBadge } from "../common/StatusBadge";
import "./OrderCard.css";

export function OrderCard({ order }: { order: Order }) {
  const itemSummary = order.items.map((item) => item.label).join(", ");
  const placedDate = new Date(order.placedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Link to={`/orders/${order.id}`} className="order-card">
      <div className="order-card__top">
        <div>
          <div className="order-card__id">{order.id}</div>
          <div className="order-card__meta">{placedDate}</div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <p className="order-card__items">{itemSummary}</p>

      <hr className="order-card__perforation" />

      <div className="order-card__bottom">
        <span className="order-card__meta">{order.paymentStatus}</span>
        <span className="order-card__total">${order.total.toFixed(2)}</span>
      </div>
    </Link>
  );
}

export default OrderCard;
