import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Hides the label visually while keeping it accessible */
  hideLabel?: boolean;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { label, hideLabel = false, error, hint, leftIcon, className, id, ...props },
    ref
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId  = `${inputId}-hint`;

    const describedBy = [
      error ? errorId : null,
      hint  ? hintId  : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {/* Label */}
        <label
          htmlFor={inputId}
          className={clsx(
            "text-sm font-medium text-foreground",
            hideLabel && "sr-only"
          )}
        >
          {label}
        </label>

        {/* Input wrapper */}
        <div className="relative flex items-center">
          {leftIcon && (
            <span
              className="absolute left-3 flex items-center text-text-muted pointer-events-none"
              aria-hidden
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={clsx(
              "w-full rounded-lg border bg-background px-3 py-2",
              "text-sm text-foreground placeholder:text-text-muted",
              "transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-accent/60 focus:ring-offset-1 focus:ring-offset-background",
              error
                ? "border-error focus:ring-error/60"
                : "border-border hover:border-text-muted",
              leftIcon && "pl-9",
              "disabled:opacity-50 disabled:bg-bg-secondary disabled:cursor-not-allowed",
              className
            )}
            {...props}
          />
        </div>

        {/* Error */}
        {error && (
          <p id={errorId} role="alert" className="text-xs text-error">
            {error}
          </p>
        )}

        {/* Hint */}
        {hint && !error && (
          <p id={hintId} className="text-xs text-text-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
