import type { ErrorInfo } from "react";

export function initSentry(): void {
  // Sentry is disabled — install @sentry/react and set VITE_SENTRY_DSN to enable
}

export function captureError(_error: Error, _info?: ErrorInfo): void {
  // no-op without Sentry configured
}
