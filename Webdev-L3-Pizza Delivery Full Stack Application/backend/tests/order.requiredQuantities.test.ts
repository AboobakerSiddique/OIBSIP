import { Types } from "mongoose";
import { computeRequiredQuantities } from "../src/services/order.service";
import type { OrderItem } from "../src/models/Order";

function makeCustomItem(
  overrides: Partial<{
    baseId: Types.ObjectId;
    sauceId: Types.ObjectId;
    cheeseId: Types.ObjectId;
    vegetableIds: Types.ObjectId[];
    quantity: number;
  }> = {}
): OrderItem {
  const baseId = overrides.baseId ?? new Types.ObjectId();
  const sauceId = overrides.sauceId ?? new Types.ObjectId();
  const cheeseId = overrides.cheeseId ?? new Types.ObjectId();
  const vegetableIds = overrides.vegetableIds ?? [];
  const quantity = overrides.quantity ?? 1;

  return {
    label: "Custom Build",
    base: { item: baseId, name: "Base", price: 0 },
    sauce: { item: sauceId, name: "Sauce", price: 0 },
    cheese: { item: cheeseId, name: "Cheese", price: 0 },
    vegetables: vegetableIds.map((id) => ({ item: id, name: "Veg", price: 0.3 })),
    quantity,
    unitPrice: 7,
    lineTotal: 7 * quantity,
  };
}

function makeMenuPizzaItem(quantity = 1): OrderItem {
  // Fixed menu pizzas have no ingredient `item` reference — "As
  // prepared" — so they should never appear in the required map.
  return {
    pizza: new Types.ObjectId(),
    label: "Margherita",
    base: { name: "As prepared", price: 0 },
    sauce: { name: "As prepared", price: 0 },
    cheese: { name: "As prepared", price: 0 },
    vegetables: [],
    quantity,
    unitPrice: 9.5,
    lineTotal: 9.5 * quantity,
  };
}

describe("computeRequiredQuantities", () => {
  it("counts one unit of each ingredient for a single custom item at quantity 1", () => {
    const item = makeCustomItem();
    const required = computeRequiredQuantities([item]);

    expect(required.get(item.base.item!.toString())).toBe(1);
    expect(required.get(item.sauce.item!.toString())).toBe(1);
    expect(required.get(item.cheese.item!.toString())).toBe(1);
  });

  it("scales required quantity by the item's quantity", () => {
    const item = makeCustomItem({ quantity: 3 });
    const required = computeRequiredQuantities([item]);

    expect(required.get(item.base.item!.toString())).toBe(3);
  });

  it("sums usage across multiple items sharing the same ingredient", () => {
    const sharedBase = new Types.ObjectId();
    const item1 = makeCustomItem({ baseId: sharedBase, quantity: 2 });
    const item2 = makeCustomItem({ baseId: sharedBase, quantity: 1 });

    const required = computeRequiredQuantities([item1, item2]);
    expect(required.get(sharedBase.toString())).toBe(3);
  });

  it("counts each vegetable separately, scaled by quantity", () => {
    const veg1 = new Types.ObjectId();
    const veg2 = new Types.ObjectId();
    const item = makeCustomItem({ vegetableIds: [veg1, veg2], quantity: 2 });

    const required = computeRequiredQuantities([item]);
    expect(required.get(veg1.toString())).toBe(2);
    expect(required.get(veg2.toString())).toBe(2);
  });

  it("does not track ingredients for fixed menu pizza items", () => {
    const required = computeRequiredQuantities([makeMenuPizzaItem(5)]);
    expect(required.size).toBe(0);
  });

  it("handles a mix of menu and custom items correctly", () => {
    const custom = makeCustomItem({ quantity: 1 });
    const menu = makeMenuPizzaItem(4);

    const required = computeRequiredQuantities([custom, menu]);
    expect(required.size).toBe(3); // base, sauce, cheese only
    expect(required.get(custom.base.item!.toString())).toBe(1);
  });

  it("returns an empty map for no items", () => {
    expect(computeRequiredQuantities([]).size).toBe(0);
  });
});
