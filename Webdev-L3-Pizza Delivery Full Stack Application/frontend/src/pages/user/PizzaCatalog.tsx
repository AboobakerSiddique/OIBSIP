import { useEffect, useState } from "react";
import { fetchPizzas } from "../../lib/api/pizzas";
import { PizzaCard } from "../../components/user/PizzaCard";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import type { Pizza } from "../../types/domain";

const CATEGORIES: Array<Pizza["category"] | "All"> = ["All", "Classic", "Signature", "Vegetarian"];

export function PizzaCatalogPage() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [pizzas, setPizzas] = useState<Pizza[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setError(null);
    setPizzas(null);
    fetchPizzas()
      .then(setPizzas)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load the menu"));
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = pizzas
    ? category === "All"
      ? pizzas
      : pizzas.filter((p) => p.category === category)
    : [];

  return (
    <div className="container section">
      <h1>The Menu</h1>
      <p className="text-muted">Six pizzas, made the same way since 1990.</p>

      <div className="cluster mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`btn btn--sm ${category === c ? "btn--primary" : "btn--secondary"}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {pizzas === null && !error && <LoadingState label="Loading the menu..." />}

      {error && (
        <ErrorState
          title="Couldn't load the menu"
          description={error}
          onRetry={load}
        />
      )}

      {pizzas && filtered.length === 0 && (
        <EmptyState
          title="Nothing here right now"
          description="No pizzas in this category at the moment — try another one."
        />
      )}

      {pizzas && filtered.length > 0 && (
        <div className="pizza-grid">
          {filtered.map((pizza) => (
            <PizzaCard key={pizza.id} pizza={pizza} />
          ))}
        </div>
      )}
    </div>
  );
}

export default PizzaCatalogPage;
