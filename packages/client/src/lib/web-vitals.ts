import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";

// ─── Reporter ─────────────────────────────────────────────────────────────────

function report(metric: Metric): void {
  // Always log to console in dev; in prod, log only critical degradations.
  if (import.meta.env.DEV) {
    const unit = metric.name === "CLS" ? "" : " ms";
    const value = metric.name === "CLS"
      ? metric.value.toFixed(4)
      : Math.round(metric.value).toString();
    console.log(`[Web Vital] ${metric.name}: ${value}${unit}  (rating: ${metric.rating})`);
    return;
  }

  // Production: send to the analytics stub endpoint via sendBeacon for
  // fire-and-forget reporting (doesn't block page unload).
  const payload = JSON.stringify({
    name:   metric.name,
    value:  metric.value,
    rating: metric.rating,
    id:     metric.id,
    delta:  metric.delta,
    path:   window.location.pathname,
  });

  const url = "/api/analytics/vitals";
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, payload);
  } else {
    void fetch(url, {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {/* swallow — vitals reporting is best-effort */});
  }
}

// ─── Entry point ─────────────────────────────────────────────────────────────

/**
 * Register all Core Web Vitals observers.
 * Call once from main.tsx after the app mounts.
 */
export function reportWebVitals(): void {
  onCLS(report);   // Cumulative Layout Shift
  onFCP(report);   // First Contentful Paint
  onINP(report);   // Interaction to Next Paint (successor to FID)
  onLCP(report);   // Largest Contentful Paint
  onTTFB(report);  // Time to First Byte
}
