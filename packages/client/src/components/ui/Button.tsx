import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "bg-accent text-white",
    "hover:bg-accent-hover",
    "focus-visible:ring-accent/50",
  ].join(" "),
  secondary: [
    "bg-background text-foreground",
    "border border-border",
    "hover:bg-bg-secondary",
    "focus-visible:ring-border",
  ].join(" "),
  ghost: [
    "bg-transparent text-foreground",
    "hover:bg-bg-secondary",
    "focus-visible:ring-border",
  ].join(" "),
  danger: [
    "bg-error text-white",
    "hover:bg-error-hover",
    "focus-visible:ring-error/50",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 px-3 py-1.5 text-xs gap-1.5 rounded-md",
  md: "h-9 px-4 py-2 text-sm gap-2 rounded-lg",
  lg: "h-11 px-5 py-2.5 text-base gap-2.5 rounded-lg",
};

const spinnerSize: Record<ButtonSize, "sm" | "md"> = {
  sm: "sm",
  md: "sm",
  lg: "md",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        className={clsx(
          "inline-flex items-center justify-center font-medium",
          "transition-colors duration-150 select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:opacity-50 disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Spinner size={spinnerSize[size]} className="shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);
