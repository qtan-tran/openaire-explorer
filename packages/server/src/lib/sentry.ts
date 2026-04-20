import type { Express, Request, Response, NextFunction } from "express";

export function initSentry(app: Express): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  // Lazy-import to avoid loading Sentry when DSN is absent
  import("@sentry/node").then(({ init, setupExpressErrorHandler }) => {
    init({ dsn, tracesSampleRate: 0.2 });
    setupExpressErrorHandler(app);
  });
}

export function sentryErrorHandler() {
  return (err: Error, _req: Request, res: Response, next: NextFunction) => {
    const dsn = process.env.SENTRY_DSN;
    if (!dsn) {
      next(err);
      return;
    }
    import("@sentry/node").then(({ captureException }) => {
      captureException(err);
      next(err);
    });
  };
}
