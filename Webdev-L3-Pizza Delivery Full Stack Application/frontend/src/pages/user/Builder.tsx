import { useEffect, useMemo, useState, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { StepIndicator } from "../../components/common/StepIndicator";
import { IngredientSelector } from "../../components/user/IngredientSelector";
import { PizzaPreview } from "../../components/user/PizzaPreview";
import { Button } from "../../components/common/Button";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import { QuantityStepper } from "../../components/common/QuantityStepper";
import { fetchIngredientCatalog, type IngredientCatalog } from "../../lib/api/ingredients";
import { useOrderDraft } from "../../lib/OrderDraftContext";
import {
  DoughBaseIcon,
  SauceBottleIcon,
  CheeseIcon,
  PepperoniIcon,
  BasilIcon,
  TomatoIcon,
} from "../../components/common/icons";
import "./Builder.css";

const STEPS = ["Base", "Sauce", "Cheese", "Vegetables", "Review"];

const VEG_ICON_BY_NAME: Record<string, (props: React.SVGProps<SVGSVGElement>) => ReactElement> = {
  "Cherry Tomato": TomatoIcon,
  "Baby Spinach": BasilIcon,
};

export function BuilderPage() {
  const navigate = useNavigate();
  const { addCustomBuild } = useOrderDraft();

  const [catalog, setCatalog] = useState<IngredientCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [stepIndex, setStepIndex] = useState(0);
  const [baseId, setBaseId] = useState<string | null>(null);
  const [sauceId, setSauceId] = useState<string | null>(null);
  const [cheeseId, setCheeseId] = useState<string | null>(null);
  const [vegetables, setVegetables] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  function load() {
    setError(null);
    setCatalog(null);
    fetchIngredientCatalog()
      .then((result) => {
        setCatalog(result);
        setBaseId(result.bases[0]?.id ?? null);
        setSauceId(result.sauces[0]?.id ?? null);
        setCheeseId(result.cheeses[0]?.id ?? null);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load ingredients")
      );
  }

  useEffect(() => {
    load();
  }, []);

  const selectedBase = catalog?.bases.find((o) => o.id === baseId);
  const selectedSauce = catalog?.sauces.find((o) => o.id === sauceId);
  const selectedCheese = catalog?.cheeses.find((o) => o.id === cheeseId);
  const selectedVeg = catalog?.vegetables.filter((v) => vegetables.includes(v.id)) ?? [];

  const unitPrice = useMemo(() => {
    if (!selectedBase || !selectedSauce || !selectedCheese) return 0;
    const dough = 7;
    return (
      dough +
      selectedBase.price +
      selectedSauce.price +
      selectedCheese.price +
      selectedVeg.reduce((sum, v) => sum + v.price, 0)
    );
  }, [selectedBase, selectedSauce, selectedCheese, selectedVeg]);

  const total = unitPrice * quantity;

  function toggleVeg(id: string) {
    setVegetables((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }

  function goNext() {
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function handleAddToOrder() {
    if (!selectedBase || !selectedSauce || !selectedCheese) return;
    addCustomBuild({
      base: selectedBase,
      sauce: selectedSauce,
      cheese: selectedCheese,
      vegetables: selectedVeg,
      quantity,
      unitPrice,
    });
    navigate("/checkout");
  }

  if (error) {
    return (
      <div className="container section">
        <h1>Build Your Pizza</h1>
        <ErrorState
          title="Couldn't load ingredients"
          description={error}
          onRetry={load}
        />
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="container section">
        <h1>Build Your Pizza</h1>
        <LoadingState label="Loading ingredients..." />
      </div>
    );
  }

  const noBasesAvailable = catalog.bases.length === 0;
  const noSaucesAvailable = catalog.sauces.length === 0;
  const noCheesesAvailable = catalog.cheeses.length === 0;

  if (noBasesAvailable || noSaucesAvailable || noCheesesAvailable) {
    return (
      <div className="container section">
        <h1>Build Your Pizza</h1>
        <EmptyState
          title="The builder is taking a short break"
          description="We're out of stock on something essential right now — check back soon, or browse the fixed menu instead."
        />
      </div>
    );
  }

  return (
    <div className="container section">
      <h1>Build Your Pizza</h1>
      <p className="text-muted">Four choices, then it's yours.</p>

      <StepIndicator steps={STEPS} currentIndex={stepIndex} />

      <div className="builder">
        <div>
          {stepIndex === 0 && (
            <section>
              <h3 className="builder__step-title">Choose your base</h3>
              <IngredientSelector
                name="base"
                mode="single"
                options={catalog.bases}
                selected={baseId ? [baseId] : []}
                onToggle={setBaseId}
                icon={() => <DoughBaseIcon />}
              />
            </section>
          )}

          {stepIndex === 1 && (
            <section>
              <h3 className="builder__step-title">Choose your sauce</h3>
              <IngredientSelector
                name="sauce"
                mode="single"
                options={catalog.sauces}
                selected={sauceId ? [sauceId] : []}
                onToggle={setSauceId}
                icon={() => <SauceBottleIcon />}
              />
            </section>
          )}

          {stepIndex === 2 && (
            <section>
              <h3 className="builder__step-title">Choose your cheese</h3>
              <IngredientSelector
                name="cheese"
                mode="single"
                options={catalog.cheeses}
                selected={cheeseId ? [cheeseId] : []}
                onToggle={setCheeseId}
                icon={() => <CheeseIcon />}
              />
            </section>
          )}

          {stepIndex === 3 && (
            <section>
              <h3 className="builder__step-title">
                Add vegetables <span className="text-muted">(pick as many as you like)</span>
              </h3>
              {catalog.vegetables.length === 0 ? (
                <EmptyState
                  title="No vegetables in stock right now"
                  description="You can still continue without any — or check back later."
                />
              ) : (
                <IngredientSelector
                  name="vegetables"
                  mode="multi"
                  options={catalog.vegetables}
                  selected={vegetables}
                  onToggle={toggleVeg}
                  icon={(_id) => {
                    const opt = catalog.vegetables.find((v) => v.id === _id);
                    const Icon = (opt && VEG_ICON_BY_NAME[opt.name]) ?? PepperoniIcon;
                    return <Icon />;
                  }}
                />
              )}
            </section>
          )}

          {stepIndex === 4 && selectedBase && selectedSauce && selectedCheese && (
            <section>
              <h3 className="builder__step-title">Review your pizza</h3>
              <ul className="stack">
                <li>Base: {selectedBase.name}</li>
                <li>Sauce: {selectedSauce.name}</li>
                <li>Cheese: {selectedCheese.name}</li>
                <li>
                  Vegetables:{" "}
                  {selectedVeg.length > 0
                    ? selectedVeg.map((v) => v.name).join(", ")
                    : "None"}
                </li>
              </ul>

              <QuantityStepper quantity={quantity} onChange={setQuantity} label="pizza quantity" />

              <Button onClick={handleAddToOrder} block>
                Add to order — ${total.toFixed(2)}
              </Button>
            </section>
          )}

          <div className="builder__nav">
            <Button variant="secondary" onClick={goBack} disabled={stepIndex === 0}>
              Back
            </Button>
            {stepIndex < STEPS.length - 1 && <Button onClick={goNext}>Next</Button>}
          </div>
        </div>

        <aside className="builder__preview">
          <div className="builder__preview-visual">
            <PizzaPreview
              hasSauce={true}
              hasCheese={true}
              vegetableCount={selectedVeg.length}
            />
          </div>
          <div className="builder__price">${total.toFixed(2)}</div>
          <div className="builder__summary">
            <div className="builder__summary-row">
              <span>Base</span>
              <span>{selectedBase?.name ?? "—"}</span>
            </div>
            <div className="builder__summary-row">
              <span>Sauce</span>
              <span>{selectedSauce?.name ?? "—"}</span>
            </div>
            <div className="builder__summary-row">
              <span>Cheese</span>
              <span>{selectedCheese?.name ?? "—"}</span>
            </div>
            <div className="builder__summary-row">
              <span>Vegetables</span>
              <span>{selectedVeg.length || "None"}</span>
            </div>
            <div className="builder__summary-row">
              <span>Quantity</span>
              <span>{quantity}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default BuilderPage;
