import type { Express, Request, Response, NextFunction } from "express";

export function initSentry(_app: Express): void {
  // Sentry is disabled — install @sentry/node and set SENTRY_DSN to enable
}

export function sentryErrorHandler() {
  return (_err: Error, _req: Request, _res: Response, next: NextFunction) => {
    next(_err);
  };
}
