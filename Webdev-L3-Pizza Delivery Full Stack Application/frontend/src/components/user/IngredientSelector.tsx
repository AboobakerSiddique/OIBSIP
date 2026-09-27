import type { ReactNode } from "react";
import type { IngredientOption } from "../../types/domain";
import "./IngredientSelector.css";

interface IngredientSelectorProps {
  options: IngredientOption[];
  selected: string[];
  onToggle: (id: string) => void;
  mode: "single" | "multi";
  icon?: (optionId: string) => ReactNode;
  name: string;
}

export function IngredientSelector({
  options,
  selected,
  onToggle,
  mode,
  icon,
  name,
}: IngredientSelectorProps) {
  return (
    <div className="ingredient-grid" role="group" aria-label={name}>
      {options.map((option) => {
        const isSelected = selected.includes(option.id);
        return (
          <label
            key={option.id}
            className={`ingredient-option ${isSelected ? "ingredient-option--selected" : ""}`}
          >
            <input
              type={mode === "single" ? "radio" : "checkbox"}
              name={name}
              checked={isSelected}
              onChange={() => onToggle(option.id)}
            />
            {icon?.(option.id)}
            <span className="ingredient-option__name">{option.name}</span>
            <span className="ingredient-option__price">
              {option.price > 0 ? `+$${option.price.toFixed(2)}` : "Included"}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export default IngredientSelector;
