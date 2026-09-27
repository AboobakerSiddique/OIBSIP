import { computeCustomPizzaPrice } from "../src/services/order.service";

describe("computeCustomPizzaPrice", () => {
  it("adds the base dough price plus each ingredient add-on", () => {
    const result = computeCustomPizzaPrice({
      basePrice: 1.5,
      saucePrice: 0.75,
      cheesePrice: 1,
      vegetablePrices: [0.3, 0.3],
      quantity: 1,
    });
    // 7 (dough) + 1.5 + 0.75 + 1 + 0.3 + 0.3 = 10.85
    expect(result.unitPrice).toBeCloseTo(10.85, 2);
    expect(result.lineTotal).toBeCloseTo(10.85, 2);
  });

  it("multiplies the unit price by quantity for the line total", () => {
    const result = computeCustomPizzaPrice({
      basePrice: 0,
      saucePrice: 0,
      cheesePrice: 0,
      vegetablePrices: [],
      quantity: 3,
    });
    expect(result.unitPrice).toBe(7);
    expect(result.lineTotal).toBe(21);
  });

  it("handles no vegetables selected", () => {
    const result = computeCustomPizzaPrice({
      basePrice: 0,
      saucePrice: 0,
      cheesePrice: 0,
      vegetablePrices: [],
      quantity: 1,
    });
    expect(result.unitPrice).toBe(7);
  });
});
