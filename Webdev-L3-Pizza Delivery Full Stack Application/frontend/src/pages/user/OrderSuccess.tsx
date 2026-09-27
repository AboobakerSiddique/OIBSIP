import { Link, useLocation, Navigate } from "react-router-dom";
import { PizzaSliceIcon } from "../../components/common/icons";

export function OrderSuccessPage() {
  const location = useLocation();
  const orderId = (location.state as { orderId?: string } | null)?.orderId;

  if (!orderId) {
    // Someone navigated here directly without completing checkout —
    // send them somewhere useful instead of showing a fake order id.
    return <Navigate to="/orders" replace />;
  }

  return (
    <div className="container section text-center" style={{ maxWidth: 480, margin: "0 auto" }}>
      <div style={{ width: 96, margin: "0 auto 1.5rem" }}>
        <PizzaSliceIcon />
      </div>
      <span className="stamp">Order Received</span>
      <h1>It's in the oven queue</h1>
      <p>
        Your order has been placed and paid for. We'll walk it through
        the kitchen and out for delivery — track it any time.
      </p>
      <div className="cluster" style={{ justifyContent: "center" }}>
        <Link to={`/orders/${orderId}`} className="btn btn--primary">
          Track this order
        </Link>
        <Link to="/pizzas" className="btn btn--secondary">
          Order something else
        </Link>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
