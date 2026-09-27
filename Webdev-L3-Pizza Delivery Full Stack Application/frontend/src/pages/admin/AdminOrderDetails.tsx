import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchAdminOrder, updateOrderStatus } from "../../lib/api/adminOrders";
import { OrderStatusTracker } from "../../components/user/OrderStatusTracker";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import { Button } from "../../components/common/Button";
import { useToast } from "../../components/common/Toast";
import { usePolling } from "../../hooks/usePolling";
import type { Order, OrderItem } from "../../types/domain";
import "./Admin.css";

const POLL_INTERVAL_MS = 8000;
const STATUS_FLOW: Order["status"][] = ["Order Received", "In Kitchen", "Sent to Delivery"];

export function AdminOrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    fetchAdminOrder(id)
      .then((result) => {
        setOrder(result);
        setNotFound(false);
        setError(null);
      })
      .catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const isDelivered = order?.status === "Sent to Delivery";
  usePolling(load, POLL_INTERVAL_MS, Boolean(order) && !isDelivered);

  if (notFound) {
    return (
      <EmptyState
        title="Order not found"
        action={
          <Link to="/admin/orders" className="btn btn--secondary btn--sm">
            Back to orders
          </Link>
        }
      />
    );
  }

  if (error) {
    return <ErrorState title="Couldn't load this order" description={error} onRetry={load} />;
  }

  if (!order || !id) {
    return <LoadingState label="Loading order..." />;
  }

  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus = STATUS_FLOW[currentIndex + 1];

  async function handleAdvance() {
    if (!nextStatus || !id) return;
    setAdvancing(true);
    try {
      const updated = await updateOrderStatus(id, nextStatus);
      setOrder(updated);
      showToast(`Order moved to "${nextStatus}"`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not update status", "error");
    } finally {
      setAdvancing(false);
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Order #{order.id.slice(-6).toUpperCase()}</h1>
      </div>

      {order.customer && (
        <p className="text-muted">
          {order.customer.name} — {order.customer.email}
        </p>
      )}

      <OrderStatusTracker status={order.status} statusHistory={order.statusHistory} isLive={!isDelivered} />

      <div className="admin-table-wrap card--padded mt-5 mb-5">
        <h3>Items</h3>
        <ul className="stack">
          {order.items.map((item: OrderItem) => (
            <li key={item.id}>
              <strong>{item.label}</strong> × {item.quantity} — {item.base}, {item.sauce}, {item.cheese}
              {item.vegetables.length > 0 ? `, ${item.vegetables.join(", ")}` : ""}
            </li>
          ))}
        </ul>
        <hr className="rule" />
        <div className="row-between">
          <span>Payment status</span>
          <span>{order.paymentStatus}</span>
        </div>
        <div className="row-between">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </div>

      <h3>Update status</h3>
      <p className="text-muted">Current status: {order.status}</p>
      {nextStatus ? (
        <Button onClick={handleAdvance} loading={advancing}>
          Move to "{nextStatus}"
        </Button>
      ) : (
        <p className="text-muted">This order has completed its journey.</p>
      )}
    </div>
  );
}

export default AdminOrderDetailsPage;
