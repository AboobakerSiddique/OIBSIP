import "./QuantityStepper.css";

interface QuantityStepperProps {
  quantity: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export function QuantityStepper({
  quantity,
  onChange,
  min = 1,
  max = 20,
  label = "quantity",
}: QuantityStepperProps) {
  return (
    <div className="quantity-stepper">
      <span>Quantity</span>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        aria-label={`Decrease ${label}`}
      >
        −
      </button>
      <span className="quantity-stepper__value" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </div>
  );
}

export default QuantityStepper;
