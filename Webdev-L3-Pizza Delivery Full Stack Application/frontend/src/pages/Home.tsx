import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPizzas } from "../lib/api/pizzas";
import { PizzaCard } from "../components/user/PizzaCard";
import { LoadingState, ErrorState } from "../components/common/States";
import {
  PizzaSliceIcon,
  OvenIcon,
  ScooterIcon,
  BasilIcon,
} from "../components/common/icons";
import { SectionDivider } from "../components/common/SectionDivider";
import { useApiHealth } from "../hooks/useApiHealth";
import type { Pizza } from "../types/domain";
import "./Home.css";

export function HomePage() {
  const { status, data } = useApiHealth();
  const [featured, setFeatured] = useState<Pizza[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setError(null);
    setFeatured(null);
    fetchPizzas()
      .then((pizzas) => setFeatured(pizzas.slice(0, 3)))
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load the menu"));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container hero__inner">
          <div>
            <span className="stamp">Est. 1990</span>
            <h1>
              <span className="wordmark">Bella Pizza</span>
            </h1>
            <p className="lede">
              Hand-stretched dough, slow-cooked sauce, and a recipe book
              that hasn't changed since the shop opened on Via Roma.
              Order the classics, or build your own from scratch.
            </p>
            <div className="hero__actions">
              <Link to="/build" className="btn btn--primary">
                Build your pizza
              </Link>
              <Link to="/pizzas" className="btn btn--secondary">
                See the menu
              </Link>
            </div>
            {status === "success" && data && (
              <p className="hero__status">Kitchen systems online — {data.database === "connected" ? "orders open" : "browsing available"}.</p>
            )}
          </div>
          <div className="hero__visual">
            <PizzaSliceIcon />
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="menu-section__header">
          <div>
            <span className="section-number">01</span>
          </div>
          <h2>Shop favorites</h2>
          <Link to="/pizzas" className="btn btn--ghost">
            Full menu
          </Link>
        </div>

        {featured === null && !error && <LoadingState label="Loading favorites..." />}
        {error && <ErrorState description={error} onRetry={load} />}
        {featured && featured.length > 0 && (
          <div className="pizza-grid">
            {featured.map((pizza) => (
              <PizzaCard key={pizza.id} pizza={pizza} />
            ))}
          </div>
        )}
      </section>

      <section className="section container">
        <div className="value-props">
          <div className="value-prop">
            <BasilIcon />
            <div>
              <h3>Real ingredients</h3>
              <p>Fresh mozzarella, San Marzano tomatoes, nothing frozen.</p>
            </div>
          </div>
          <div className="value-prop">
            <OvenIcon />
            <div>
              <h3>Fired to order</h3>
              <p>Every pizza goes in the oven only after you check out.</p>
            </div>
          </div>
          <div className="value-prop">
            <ScooterIcon />
            <div>
              <h3>Tracked delivery</h3>
              <p>Watch your order move from the oven to your door.</p>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      <section className="section container">
        <div className="cta-band">
          <div>
            <h2>Build the pizza only you would order</h2>
            <p>Pick your base, sauce, cheese, and toppings — see the price update as you go.</p>
          </div>
          <Link to="/build" className="btn btn--primary">
            Start building
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
