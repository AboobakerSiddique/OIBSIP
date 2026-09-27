import type { OrderStatus } from "../common/StatusBadge";
import type { StatusHistoryEntry } from "../../types/domain";
import "./OrderStatusTracker.css";

const STAGES: { key: OrderStatus; label: string; icon: string }[] = [
  { key: "Order Received", label: "Order Received", icon: "1" },
  { key: "In Kitchen", label: "In Kitchen", icon: "2" },
  { key: "Sent to Delivery", label: "Sent to Delivery", icon: "3" },
];

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

interface OrderStatusTrackerProps {
  status: OrderStatus;
  statusHistory?: StatusHistoryEntry[];
  isLive?: boolean;
}

export function OrderStatusTracker({ status, statusHistory, isLive }: OrderStatusTrackerProps) {
  const currentIndex = STAGES.findIndex((s) => s.key === status);

  return (
    <div className="order-tracker" role="status" aria-label={`Order status: ${status}`}>
      {STAGES.map((stage, index) => {
        const state =
          index < currentIndex ? "done" : index === currentIndex ? "current" : "";
        const historyEntry = statusHistory?.find((h) => h.status === stage.key);

        return (
          <div
            key={stage.key}
            className={`order-tracker__stage ${state ? `order-tracker__stage--${state}` : ""}`}
          >
            <span className="order-tracker__icon">
              {index < currentIndex ? "✓" : stage.icon}
            </span>
            <span className="order-tracker__label">{stage.label}</span>
            {historyEntry ? (
              <span className="order-tracker__time">{formatTime(historyEntry.at)}</span>
            ) : (
              index === currentIndex &&
              isLive && <span className="order-tracker__time">Updating live</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default OrderStatusTracker;
