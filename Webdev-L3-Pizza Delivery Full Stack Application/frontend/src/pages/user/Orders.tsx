import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchMyOrders } from "../../lib/api/orders";
import { OrderCard } from "../../components/user/OrderCard";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import type { Order } from "../../types/domain";

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setError(null);
    setOrders(null);
    fetchMyOrders()
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load your orders"));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="container section">
      <h1>My Orders</h1>

      {orders === null && !error && <LoadingState label="Loading your orders..." />}
      {error && <ErrorState title="Couldn't load your orders" description={error} onRetry={load} />}

      {orders && orders.length === 0 && (
        <EmptyState
          title="No orders yet"
          description="Once you place an order, you'll be able to track it here."
          action={
            <Link to="/pizzas" className="btn btn--primary btn--sm">
              Browse the menu
            </Link>
          }
        />
      )}

      {orders && orders.length > 0 && (
        <div className="stack">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
