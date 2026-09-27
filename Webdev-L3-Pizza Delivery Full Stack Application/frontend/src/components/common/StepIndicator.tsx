import "./StepIndicator.css";

interface StepIndicatorProps {
  steps: string[];
  currentIndex: number;
}

export function StepIndicator({ steps, currentIndex }: StepIndicatorProps) {
  return (
    <ol className="step-indicator">
      {steps.map((label, index) => {
        const state =
          index === currentIndex ? "active" : index < currentIndex ? "done" : "";
        return (
          <li key={label} style={{ display: "contents" }}>
            <div className={`step-indicator__step ${state ? `step-indicator__step--${state}` : ""}`}>
              <span className="step-indicator__badge">
                {index < currentIndex ? "✓" : index + 1}
              </span>
              <span className="step-indicator__label">{label}</span>
            </div>
            {index < steps.length - 1 && <span className="step-indicator__connector" />}
          </li>
        );
      })}
    </ol>
  );
}

export default StepIndicator;
