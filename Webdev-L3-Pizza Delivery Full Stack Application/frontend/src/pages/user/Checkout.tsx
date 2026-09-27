import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useOrderDraft } from "../../lib/OrderDraftContext";
import { useAuth } from "../../lib/AuthContext";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/States";
import { useToast } from "../../components/common/Toast";
import {
  draftItemsToCheckoutInput,
  initiateCheckout,
  verifyPayment,
} from "../../lib/api/orders";
import { ApiClientError } from "../../lib/apiClient";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, removeItem, clear } = useOrderDraft();
  const { showToast } = useToast();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const delivery = items.length > 0 ? 2.5 : 0;
  const total = subtotal + delivery;

  async function handlePay() {
    setError(null);
    setPaying(true);

    try {
      const checkoutItems = draftItemsToCheckoutInput(items);
      const session = await initiateCheckout(checkoutItems);

      if (typeof window.Razorpay === "undefined") {
        throw new Error(
          "Payment isn't available right now — the checkout script didn't load. Check your connection and try again."
        );
      }

      const razorpay = new window.Razorpay({
        key: session.keyId,
        amount: session.amount,
        currency: session.currency,
        name: "Bella Pizza",
        description: "Order payment (test mode)",
        order_id: session.razorpayOrderId,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#9F280A" },
        handler: async (response) => {
          try {
            const order = await verifyPayment(checkoutItems, response);
            clear();
            navigate("/order-success", { state: { orderId: order._id } });
          } catch (err) {
            setError(
              err instanceof ApiClientError
                ? err.message
                : "Payment succeeded but we couldn't confirm your order. Contact support with your payment ID."
            );
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            showToast("Checkout cancelled — your order hasn't been placed.");
          },
        },
      });

      razorpay.on("payment.failed", () => {
        setPaying(false);
        setError("Payment failed. No charge was made — you can try again.");
      });

      razorpay.open();
    } catch (err) {
      setPaying(false);
      setError(err instanceof ApiClientError ? err.message : "Could not start checkout. Please try again.");
    }
  }

  if (items.length === 0) {
    return (
      <div className="container section">
        <EmptyState
          title="Your order is empty"
          description="Add a pizza from the menu or the builder before checking out."
          action={
            <Link to="/pizzas" className="btn btn--primary btn--sm">
              Browse the menu
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container section max-w-md">
      <h1>Checkout</h1>

      <div className="card card--padded mb-5">
        <h3>Order summary</h3>
        <ul className="stack">
          {items.map((item) => (
            <li key={item.id} className="row-between" style={{ alignItems: "flex-start" }}>
              <div>
                <div>
                  {item.label} × {item.quantity}
                </div>
                {item.baseName && (
                  <div className="text-muted" style={{ fontSize: "0.82rem" }}>
                    {item.baseName}, {item.sauceName}, {item.cheeseName}
                    {item.vegetableNames && item.vegetableNames.length > 0
                      ? `, ${item.vegetableNames.join(", ")}`
                      : ""}
                  </div>
                )}
              </div>
              <div className="cluster">
                <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.label} from order`}
                  disabled={paying}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
        <hr className="rule" />
        <div className="row-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="row-between">
          <span>Delivery</span>
          <span>${delivery.toFixed(2)}</span>
        </div>
        <div className="row-between price-total">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <p className="field-error mb-4" role="alert">
          {error}
        </p>
      )}

      <p className="text-muted">
        Payment runs through Razorpay in test mode — no real charge will be made.
      </p>

      <Button onClick={handlePay} block loading={paying}>
        Pay ${total.toFixed(2)}
      </Button>
    </div>
  );
}

export default CheckoutPage;
