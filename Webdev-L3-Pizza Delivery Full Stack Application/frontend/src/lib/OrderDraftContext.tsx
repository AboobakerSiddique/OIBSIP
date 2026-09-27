import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { IngredientOption, Pizza } from "../types/domain";

export interface DraftItem {
  id: string;
  label: string;
  quantity: number;
  unitPrice: number;
  // Present only for custom builds — omitted when ordering a fixed menu pizza.
  pizzaId?: string;
  baseId?: string;
  sauceId?: string;
  cheeseId?: string;
  vegetableIds?: string[];
  baseName?: string;
  sauceName?: string;
  cheeseName?: string;
  vegetableNames?: string[];
}

interface OrderDraftContextValue {
  items: DraftItem[];
  subtotal: number;
  addMenuPizza: (pizza: Pizza, quantity: number) => void;
  addCustomBuild: (config: {
    base: IngredientOption;
    sauce: IngredientOption;
    cheese: IngredientOption;
    vegetables: IngredientOption[];
    quantity: number;
    unitPrice: number;
  }) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

const OrderDraftContext = createContext<OrderDraftContextValue | null>(null);

let nextId = 1;

export function OrderDraftProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<DraftItem[]>([]);

  const addMenuPizza = useCallback((pizza: Pizza, quantity: number) => {
    setItems((prev) => [
      ...prev,
      {
        id: `draft-${nextId++}`,
        label: pizza.name,
        quantity,
        unitPrice: pizza.price,
        pizzaId: pizza.id,
      },
    ]);
  }, []);

  const addCustomBuild = useCallback(
    (config: {
      base: IngredientOption;
      sauce: IngredientOption;
      cheese: IngredientOption;
      vegetables: IngredientOption[];
      quantity: number;
      unitPrice: number;
    }) => {
      setItems((prev) => [
        ...prev,
        {
          id: `draft-${nextId++}`,
          label: "Custom Build",
          quantity: config.quantity,
          unitPrice: config.unitPrice,
          baseId: config.base.id,
          sauceId: config.sauce.id,
          cheeseId: config.cheese.id,
          vegetableIds: config.vegetables.map((v) => v.id),
          baseName: config.base.name,
          sauceName: config.sauce.name,
          cheeseName: config.cheese.name,
          vegetableNames: config.vegetables.map((v) => v.name),
        },
      ]);
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  );

  return (
    <OrderDraftContext.Provider
      value={{ items, subtotal, addMenuPizza, addCustomBuild, removeItem, clear }}
    >
      {children}
    </OrderDraftContext.Provider>
  );
}

export function useOrderDraft() {
  const ctx = useContext(OrderDraftContext);
  if (!ctx) {
    throw new Error("useOrderDraft must be used within an OrderDraftProvider");
  }
  return ctx;
}
