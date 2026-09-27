import { PizzaSliceIcon } from "./icons";
import "./SectionDivider.css";

export function SectionDivider() {
  return (
    <div className="section-divider" role="presentation" aria-hidden="true">
      <span className="section-divider__line" />
      <span className="section-divider__icon">
        <PizzaSliceIcon />
      </span>
      <span className="section-divider__line" />
    </div>
  );
}

export default SectionDivider;
