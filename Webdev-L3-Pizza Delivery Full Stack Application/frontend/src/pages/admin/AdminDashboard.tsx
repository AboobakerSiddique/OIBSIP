import { useEffect, useState } from "react";
import { fetchAllOrders } from "../../lib/api/adminOrders";
import { fetchInventory } from "../../lib/api/adminInventory";
import { OrderStatusBadge } from "../../components/common/StatusBadge";
import { LoadingState, ErrorState } from "../../components/common/States";
import type { Order, InventoryItem } from "../../types/domain";
import "./Admin.css";

export function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setError(null);
    Promise.all([fetchAllOrders(), fetchInventory()])
      .then(([orderResult, inventoryResult]) => {
        setOrders(orderResult);
        setInventory(inventoryResult);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load dashboard data"));
  }

  useEffect(() => {
    load();
  }, []);

  if (error) {
    return (
      <div>
        <div className="admin-page-header">
          <h1>Dashboard</h1>
        </div>
        <ErrorState title="Couldn't load the dashboard" description={error} onRetry={load} />
      </div>
    );
  }

  if (!orders || !inventory) {
    return (
      <div>
        <div className="admin-page-header">
          <h1>Dashboard</h1>
        </div>
        <LoadingState label="Loading dashboard..." />
      </div>
    );
  }

  const lowStockCount = inventory.filter((i) => i.status !== "Healthy").length;
  const pendingOrders = orders.filter((o) => o.status !== "Sent to Delivery").length;
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-card__value">{orders.length}</div>
          <div className="admin-stat-card__label">Total orders</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__value">{pendingOrders}</div>
          <div className="admin-stat-card__label">In progress</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__value">${revenue.toFixed(2)}</div>
          <div className="admin-stat-card__label">Total revenue</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__value">{lowStockCount}</div>
          <div className="admin-stat-card__label">Low stock alerts</div>
        </div>
      </div>

      <h3>Latest orders</h3>
      {orders.length === 0 ? (
        <p className="text-muted">No orders yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id}>
                  <td>#{order.id.slice(-6).toUpperCase()}</td>
                  <td>{order.items.length} item(s)</td>
                  <td>${order.total.toFixed(2)}</td>
                  <td>
                    <OrderStatusBadge status={order.status} />
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

export default AdminDashboardPage;
