interface PizzaPreviewProps {
  hasSauce: boolean;
  hasCheese: boolean;
  vegetableCount: number;
}

/**
 * Deterministic pseudo-random topping placement so the preview looks
 * organically scattered rather than a perfect grid, without needing
 * actual randomness (keeps the render stable across re-renders).
 */
const TOPPING_SPOTS = [
  [50, 40], [68, 50], [40, 62], [60, 72], [32, 46], [72, 34],
  [46, 78], [80, 60], [36, 32], [56, 55], [26, 66], [64, 44],
];

export function PizzaPreview({ hasSauce, hasCheese, vegetableCount }: PizzaPreviewProps) {
  const spots = TOPPING_SPOTS.slice(0, Math.min(vegetableCount * 2, TOPPING_SPOTS.length));

  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" role="img" aria-label="Pizza preview">
      {/* crust */}
      <circle cx="50" cy="50" r="46" fill="#e7c98f" stroke="var(--green)" strokeWidth="2" />
      {/* base */}
      <circle cx="50" cy="50" r="40" fill={hasSauce ? "#c34a1c" : "#f1dcae"} />
      {/* cheese */}
      {hasCheese && <circle cx="50" cy="50" r="37" fill="#f3d98a" opacity="0.85" />}
      {/* toppings */}
      {spots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.2} fill="var(--green)" opacity={0.85} />
      ))}
      <circle cx="50" cy="50" r="46" fill="none" stroke="var(--green)" strokeWidth="2" strokeDasharray="2 4" />
    </svg>
  );
}

export default PizzaPreview;
