import { Link } from "react-router-dom";
import type { Pizza } from "../../types/domain";
import { PizzaSliceIcon } from "../common/icons";
import "./PizzaCard.css";

export function PizzaCard({ pizza }: { pizza: Pizza }) {
  return (
    <Link to={`/pizzas/${pizza.id}`} className="pizza-card">
      <div className="pizza-card__visual">
        <PizzaSliceIcon />
      </div>
      <div className="pizza-card__body">
        <span className="pizza-card__category">{pizza.category}</span>
        <h3 className="pizza-card__name">{pizza.name}</h3>
        <p className="pizza-card__desc">{pizza.description}</p>
        <div className="pizza-card__footer">
          <span className="pizza-card__price">${pizza.price.toFixed(2)}</span>
          <span className="btn btn--secondary btn--sm">View</span>
        </div>
      </div>
    </Link>
  );
}

export default PizzaCard;
