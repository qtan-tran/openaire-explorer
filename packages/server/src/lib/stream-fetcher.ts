/**
 * Server-Sent Events (SSE) streaming helper.
 *
 * Streams cursor-paginated OpenAIRE results to the client page-by-page,
 * allowing the UI to display partial results immediately instead of waiting
 * for the full dataset to be fetched.
 */

import type { Response } from "express";
import { getOpenAIREClient } from "./openaire-client.js";
import { logger } from "./logger.js";
import type { ResearchProductSearchParams } from "@openaire-explorer/shared";

// ─── SSE primitives ───────────────────────────────────────────────────────────

/** Write a single named SSE event. */
export function sseWrite<T>(res: Response, event: string, data: T): void {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/** Set SSE response headers and flush immediately so the connection opens. */
export function sseInit(res: Response): void {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // disable nginx proxy buffering
  res.flushHeaders();
}

// ─── Product stream ───────────────────────────────────────────────────────────

export interface StreamProductsOptions {
  params: ResearchProductSearchParams;
  maxResults?: number;
}

/**
 * Streams research products to an SSE response, one page at a time.
 *
 * Event types emitted:
 *  - `page`     — `{ results: ResearchProduct[], fetched: number }`
 *  - `progress` — `{ fetched: number, total: number }`  (after each page)
 *  - `done`     — `{ total: number }`
 *  - `error`    — `{ message: string }`
 */
export async function streamProducts(
  res: Response,
  { params, maxResults = 2000 }: StreamProductsOptions
): Promise<void> {
  sseInit(res);

  const client = getOpenAIREClient();
  let total = 0;
  let cursor = "*";
  const pageSize = 100;

  try {
    while (total < maxResults) {
      const result = await client.searchResearchProducts({
        ...params,
        cursor,
        pageSize,
      });

      if (result.results.length === 0) break;
      total += result.results.length;

      sseWrite(res, "page", { results: result.results, fetched: total });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const numFound = (result.header as any).numFound as number | undefined;
      sseWrite(res, "progress", { fetched: total, total: numFound ?? total });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nextCursor = (result.header as any).nextCursor as string | undefined;
      if (!nextCursor) break;
      cursor = nextCursor;
    }

    sseWrite(res, "done", { total });
    logger.debug({ total }, "SSE stream complete");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stream error";
    logger.warn({ err }, "SSE stream error");
    sseWrite(res, "error", { message });
  } finally {
    res.end();
  }
}
