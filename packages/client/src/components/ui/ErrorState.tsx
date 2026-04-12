import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={
        "flex flex-col items-center justify-center gap-4 py-16 px-6 text-center " +
        (className ?? "")
      }
    >
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10"
        aria-hidden
      >
        <AlertTriangle className="h-6 w-6 text-error" strokeWidth={2} />
      </span>

      <div className="flex flex-col gap-1.5 max-w-sm">
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>

      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
