/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  // Dark mode is handled via [data-theme="dark"] on <html> through CSS vars.
  // We don't use Tailwind's dark: variant — CSS custom properties do the work.
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "Consolas", "monospace"],
      },
      colors: {
        // Backgrounds
        background:       "hsl(var(--color-bg-primary) / <alpha-value>)",
        "bg-secondary":   "hsl(var(--color-bg-secondary) / <alpha-value>)",
        "bg-tertiary":    "hsl(var(--color-bg-tertiary) / <alpha-value>)",
        // Text
        foreground:       "hsl(var(--color-text-primary) / <alpha-value>)",
        "text-secondary": "hsl(var(--color-text-secondary) / <alpha-value>)",
        "text-muted":     "hsl(var(--color-text-muted) / <alpha-value>)",
        // Borders
        border: {
          DEFAULT: "hsl(var(--color-border) / <alpha-value>)",
          subtle:  "hsl(var(--color-border-subtle) / <alpha-value>)",
        },
        // Accent
        accent: {
          DEFAULT: "hsl(var(--color-accent) / <alpha-value>)",
          hover:   "hsl(var(--color-accent-hover) / <alpha-value>)",
          muted:   "hsl(var(--color-accent-muted) / <alpha-value>)",
        },
        // Semantic
        success: "hsl(var(--color-success) / <alpha-value>)",
        warning: "hsl(var(--color-warning) / <alpha-value>)",
        error: {
          DEFAULT: "hsl(var(--color-error) / <alpha-value>)",
          hover:   "hsl(var(--color-error-hover) / <alpha-value>)",
        },
        // Open Access
        "oa-gold":   "hsl(var(--color-oa-gold) / <alpha-value>)",
        "oa-green":  "hsl(var(--color-oa-green) / <alpha-value>)",
        "oa-hybrid": "hsl(var(--color-oa-hybrid) / <alpha-value>)",
        "oa-bronze": "hsl(var(--color-oa-bronze) / <alpha-value>)",
        "oa-closed": "hsl(var(--color-oa-closed) / <alpha-value>)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      ringOffsetColor: {
        background: "hsl(var(--color-bg-primary))",
      },
    },
  },
  plugins: [],
};
