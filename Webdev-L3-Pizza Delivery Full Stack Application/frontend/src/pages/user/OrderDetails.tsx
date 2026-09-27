import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchMyOrderById } from "../../lib/api/orders";
import { OrderStatusTracker } from "../../components/user/OrderStatusTracker";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import { usePolling } from "../../hooks/usePolling";
import type { Order } from "../../types/domain";
import { ApiClientError } from "../../lib/apiClient";

const POLL_INTERVAL_MS = 6000;

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!id) return;
    fetchMyOrderById(id)
      .then((result) => {
        setOrder(result);
        setNotFound(false);
        setError(null);
      })
      .catch((err) => {
        if (err instanceof ApiClientError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : "Could not load this order");
        }
      });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Stop polling once the order has reached its final stage — no point
  // hitting the API forever for something that will never change again.
  const isDelivered = order?.status === "Sent to Delivery";
  usePolling(load, POLL_INTERVAL_MS, Boolean(order) && !isDelivered);

  if (notFound) {
    return (
      <div className="container section">
        <EmptyState
          title="Order not found"
          description="Check My Orders for a current list."
          action={
            <Link to="/orders" className="btn btn--secondary btn--sm">
              Back to orders
            </Link>
          }
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container section">
        <ErrorState title="Couldn't load this order" description={error} onRetry={load} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container section">
        <LoadingState label="Loading order..." />
      </div>
    );
  }

  const placedDate = new Date(order.placedAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="container section max-w-lg">
      <div className="row-between">
        <div>
          <h1>Order #{order.id.slice(-6).toUpperCase()}</h1>
          <p className="text-muted">Placed {placedDate}</p>
        </div>
      </div>

      <OrderStatusTracker
        status={order.status}
        statusHistory={order.statusHistory}
        isLive={!isDelivered}
      />

      <div className="card card--padded mt-5">
        <h3>Items</h3>
        <ul className="stack">
          {order.items.map((item) => (
            <li key={item.id}>
              <strong>{item.label}</strong> × {item.quantity}
              <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                {item.base}, {item.sauce}, {item.cheese}
                {item.vegetables.length > 0 ? `, ${item.vegetables.join(", ")}` : ""}
              </div>
            </li>
          ))}
        </ul>
        <hr className="rule" />
        <div className="row-between">
          <span>Payment</span>
          <span>{order.paymentStatus}</span>
        </div>
        <div className="row-between price-total">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsPage;
