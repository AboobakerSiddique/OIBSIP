import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllOrders } from "../../lib/api/adminOrders";
import { OrderStatusBadge } from "../../components/common/StatusBadge";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import { usePolling } from "../../hooks/usePolling";
import type { Order } from "../../types/domain";
import "./Admin.css";

const POLL_INTERVAL_MS = 8000;

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetchAllOrders()
      .then((result) => {
        setOrders(result);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load orders"));
  }

  useEffect(() => {
    load();
  }, []);

  // New orders can arrive anytime — keep the list fresh while it's open.
  usePolling(load, POLL_INTERVAL_MS, true);

  return (
    <div>
      <div className="admin-page-header">
        <h1>Orders</h1>
      </div>

      {orders === null && !error && <LoadingState label="Loading orders..." />}
      {error && <ErrorState title="Couldn't load orders" description={error} onRetry={load} />}
      {orders && orders.length === 0 && <EmptyState title="No orders yet" />}

      {orders && orders.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id.slice(-6).toUpperCase()}</td>
                  <td>{order.customer?.name ?? "—"}</td>
                  <td>{order.items.map((i) => i.label).join(", ")}</td>
                  <td>${order.total.toFixed(2)}</td>
                  <td>{order.paymentStatus}</td>
                  <td>
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td>
                    <Link to={`/admin/orders/${order.id}`} className="btn btn--secondary btn--sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminOrdersPage;
