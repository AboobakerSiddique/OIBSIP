import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyOrders } from "../../lib/api/orders";
import { OrderCard } from "../../components/user/OrderCard";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import { useAuth } from "../../lib/AuthContext";
import type { Order } from "../../types/domain";

export function DashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setError(null);
    setOrders(null);
    fetchMyOrders()
      .then((all) => setOrders(all.slice(0, 3)))
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load orders"));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="container section">
      <h1>Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}</h1>
      <p className="text-muted">Here's what's happening with your account.</p>

      <div className="cluster mb-6">
        <Link to="/build" className="btn btn--primary">
          Build a pizza
        </Link>
        <Link to="/pizzas" className="btn btn--secondary">
          Browse menu
        </Link>
      </div>

      <h2>Recent orders</h2>

      {orders === null && !error && <LoadingState label="Loading orders..." />}
      {error && <ErrorState description={error} onRetry={load} />}
      {orders && orders.length === 0 && (
        <EmptyState
          title="No orders yet"
          description="Your recent orders will show up here once you place one."
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

export default DashboardPage;
