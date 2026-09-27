import type { InputHTMLAttributes } from "react";
import { useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, id, ...rest }: InputProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className="field">
      <label htmlFor={fieldId}>{label}</label>
      <input
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...rest}
      />
      {error && (
        <span className="field-error" id={`${fieldId}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

export default Input;
