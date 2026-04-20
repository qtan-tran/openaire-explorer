import type { ErrorInfo } from "react";

interface SentryClient {
  captureException(error: Error, context?: { extra?: Record<string, unknown> }): void;
}

let sentry: SentryClient | null = null;

export async function initSentry(): Promise<void> {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  const { init, browserTracingIntegration } = await import("@sentry/react");
  init({
    dsn,
    integrations: [browserTracingIntegration()],
    tracesSampleRate: 0.2,
  });

  const { captureException } = await import("@sentry/react");
  sentry = { captureException };
}

export function captureError(error: Error, info?: ErrorInfo): void {
  sentry?.captureException(error, {
    extra: info ? { componentStack: info.componentStack } : undefined,
  });
}
