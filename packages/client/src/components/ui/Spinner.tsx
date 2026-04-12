import clsx from "clsx";

type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  /** Accessible label for screen readers */
  label?: string;
}

const sizeMap: Record<SpinnerSize, { svg: string; stroke: number }> = {
  sm: { svg: "w-4 h-4", stroke: 2 },
  md: { svg: "w-6 h-6", stroke: 2 },
  lg: { svg: "w-8 h-8", stroke: 2.5 },
};

export function Spinner({ size = "md", className, label = "Loading…" }: SpinnerProps) {
  const { svg, stroke } = sizeMap[size];

  return (
    <svg
      role="status"
      aria-label={label}
      viewBox="0 0 24 24"
      fill="none"
      className={clsx("animate-spin text-accent", svg, className)}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeOpacity={0.25}
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </svg>
  );
}
