/**
 * Optional cache warm-up on server start.
 *
 * Disabled by default — enable with env var:
 *   WARM_CACHE=true npm start
 *
 * Fetches a small set of common queries so the first real user
 * request hits the in-memory cache instead of the upstream API.
 */

import { getOpenAIREClient } from "./openaire-client.js";
import { computeOADistribution, computeTrendsData } from "./metrics-computer.js";
import { logger } from "./logger.js";
import type { ResearchProduct, ResearchProductSearchParams } from "@openaire-explorer/shared";

// ─── Queries to pre-warm ─────────────────────────────────────────────────────

interface WarmQuery {
  label: string;
  params: Partial<ResearchProductSearchParams>;
}

const WARM_QUERIES: WarmQuery[] = [
  { label: "climate-change",  params: { search: "climate change" } },
  { label: "ec-funded",       params: { funder: "EC" } },
  { label: "covid",           params: { search: "covid-19" } },
];

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function fetchProducts(
  params: Partial<ResearchProductSearchParams>,
  max = 300
): Promise<ResearchProduct[]> {
  const client = getOpenAIREClient();
  const all: ResearchProduct[] = [];
  let cursor = "*";

  while (all.length < max) {
    const result = await client.searchResearchProducts({
      ...(params as ResearchProductSearchParams),
      cursor,
      pageSize: 100,
    });
    all.push(...result.results);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const next = (result.header as any).nextCursor as string | undefined;
    if (!next || result.results.length === 0) break;
    cursor = next;
  }

  return all.slice(0, max);
}

// ─── Warm-up entry point ──────────────────────────────────────────────────────

/**
 * Run cache warm-up. No-ops unless `WARM_CACHE=true` is set in the environment.
 * Failures are logged and swallowed so a bad warm-up never prevents startup.
 */
export async function warmCache(): Promise<void> {
  if (process.env["WARM_CACHE"] !== "true") return;

  logger.info({ queries: WARM_QUERIES.length }, "Cache warm-up starting");

  const results = await Promise.allSettled(
    WARM_QUERIES.map(async ({ label, params }) => {
      const products = await fetchProducts(params);
      computeOADistribution(products);
      computeTrendsData(products, "year");
      logger.info({ label, count: products.length }, "Cache warmed");
    })
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  if (failed > 0) {
    logger.warn({ failed }, "Some cache warm-up queries failed");
  }

  logger.info("Cache warm-up complete");
}
