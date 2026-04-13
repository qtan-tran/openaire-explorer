import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { OpenAIREError, NetworkError } from "../lib/openaire-client.js";
import { logger } from "../lib/logger.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation errors (should mostly be caught by validate middleware, but just in case)
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      code: "VALIDATION_ERROR",
      details: err.flatten().fieldErrors,
    });
    return;
  }

  // OpenAIRE upstream errors
  if (err instanceof OpenAIREError) {
    logger.warn({ statusCode: err.statusCode, body: err.body }, "OpenAIRE API error");

    if (err.statusCode === 404) {
      res.status(404).json({ error: "Resource not found", code: "NOT_FOUND" });
      return;
    }
    if (err.statusCode === 400) {
      res.status(400).json({ error: "Bad request to upstream API", code: "BAD_REQUEST" });
      return;
    }
    if (err.statusCode === 429) {
      res.status(429).json({ error: "Upstream rate limit exceeded", code: "RATE_LIMITED" });
      return;
    }
    // 5xx or other upstream errors → 502
    res.status(502).json({
      error: "Upstream API error",
      code: "UPSTREAM_ERROR",
      details: { upstreamStatus: err.statusCode },
    });
    return;
  }

  // Network / connectivity errors
  if (err instanceof NetworkError) {
    logger.error({ err }, "Network error reaching OpenAIRE");
    res.status(502).json({ error: "Failed to reach upstream API", code: "NETWORK_ERROR" });
    return;
  }

  // Generic errors
  const message = err instanceof Error ? err.message : "Unknown error";
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal server error", code: "INTERNAL_ERROR", details: message });
}
