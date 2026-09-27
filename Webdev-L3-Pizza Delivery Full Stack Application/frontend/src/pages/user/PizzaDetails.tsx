import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchPizzaById } from "../../lib/api/pizzas";
import { ApiClientError } from "../../lib/apiClient";
import { PizzaSliceIcon } from "../../components/common/icons";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import { Button } from "../../components/common/Button";
import { QuantityStepper } from "../../components/common/QuantityStepper";
import { useOrderDraft } from "../../lib/OrderDraftContext";
import type { Pizza } from "../../types/domain";
import "./PizzaDetails.css";

export function PizzaDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addMenuPizza } = useOrderDraft();
  const [pizza, setPizza] = useState<Pizza | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  function load() {
    if (!id) return;
    setError(null);
    setNotFound(false);
    setPizza(null);
    fetchPizzaById(id).catch((err) => {
      if (err instanceof ApiClientError && err.status === 404) {
        setNotFound(true);
      } else {
        setError(err instanceof Error ? err.message : "Could not load this pizza");
      }
    }).then((result) => {
      if (result) setPizza(result);
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (notFound) {
    return (
      <div className="container section">
        <EmptyState
          title="We couldn't find that pizza"
          description="It may have come off the menu. Take a look at what's on it now."
          action={
            <Link to="/pizzas" className="btn btn--secondary btn--sm">
              Back to menu
            </Link>
          }
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container section">
        <ErrorState title="Couldn't load this pizza" description={error} onRetry={load} />
      </div>
    );
  }

  if (!pizza) {
    return (
      <div className="container section">
        <LoadingState label="Loading pizza..." />
      </div>
    );
  }

  function handleOrder() {
    if (!pizza) return;
    addMenuPizza(pizza, quantity);
    navigate("/checkout");
  }

  return (
    <div className="container section pizza-details">
      <div className="pizza-details__visual">
        <PizzaSliceIcon />
      </div>
      <div>
        <span className="pizza-card__category">{pizza.category}</span>
        <h1>{pizza.name}</h1>
        <p>{pizza.description}</p>
        <ul className="pizza-details__toppings">
          {pizza.toppings.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <div className="pizza-details__price">${pizza.price.toFixed(2)}</div>

        <QuantityStepper quantity={quantity} onChange={setQuantity} label="pizza quantity" />

        <div className="cluster">
          <Button onClick={handleOrder}>Order this pizza</Button>
          <Link to="/build" className="btn btn--secondary">
            Customize instead
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PizzaDetailsPage;
