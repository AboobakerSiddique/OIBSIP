import type { ReactNode } from "react";
import { Button } from "./Button";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="state-block cluster" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="state-block">
      <h3>{title}</h3>
      {description && <p className="text-muted">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="state-block">
      <h3>{title}</h3>
      {description && <p className="text-muted">{description}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
