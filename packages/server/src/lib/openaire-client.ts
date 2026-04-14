import type {
  PaginatedResponse,
  ResearchProduct,
  Organization,
  Project,
  ResearchProductSearchParams,
  OrganizationSearchParams,
  ProjectSearchParams,
  CursorHeader,
} from "@openaire-explorer/shared";

import { TokenBucketRateLimiter } from "./rate-limiter.js";
import { CacheService } from "./cache.js";
import {
  buildResearchProductQuery,
  buildOrganizationQuery,
  buildProjectQuery,
  applyParams,
  type RawParams,
} from "./query-builder.js";
import {
  normalizeResearchProduct,
  normalizeOrganization,
  normalizeProject,
} from "./normalizer.js";
import { logger } from "./logger.js";

// ─── Error types ──────────────────────────────────────────────────────────────

export class OpenAIREError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly body: string
  ) {
    super(`OpenAIRE API error ${statusCode}: ${body.slice(0, 200)}`);
    this.name = "OpenAIREError";
  }
}

export class NetworkError extends Error {
  constructor(cause: unknown) {
    const msg = cause instanceof Error ? cause.message : String(cause);
    super(`Network error: ${msg}`, { cause: cause instanceof Error ? cause : undefined });
    this.name = "NetworkError";
  }
}

// ─── Config ───────────────────────────────────────────────────────────────────

export interface OpenAIREClientConfig {
  baseUrl: string;
  /** Request timeout in ms (default 12 000) */
  timeout?: number;
  /** Max retry attempts for 429 / 5xx (default 3) */
  maxRetries?: number;
  /** Token-bucket capacity and steady-state rate in req/s (default 30) */
  rateLimit?: number;
  /** Cache TTL in seconds (default 300) */
  cacheTtl?: number;
}

// ─── API path constants ───────────────────────────────────────────────────────

const PATHS = {
  researchProducts: "/v2/researchProducts",
  organizations: "/v1/organizations",
  projects: "/v1/projects",
} as const;

// ─── Utilities ────────────────────────────────────────────────────────────────

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// ─── Client ───────────────────────────────────────────────────────────────────

export class OpenAIREClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly rateLimiter: TokenBucketRateLimiter;
  readonly cache: CacheService;
  /** Deduplicate concurrent requests for the same resource. */
  private readonly _inflight = new Map<string, Promise<unknown>>();

  constructor(cfg: OpenAIREClientConfig) {
    this.baseUrl = cfg.baseUrl.replace(/\/$/, "");
    this.timeout = cfg.timeout ?? 12_000;
    this.maxRetries = cfg.maxRetries ?? 3;
    this.rateLimiter = new TokenBucketRateLimiter(
      cfg.rateLimit ?? 30,
      cfg.rateLimit ?? 30
    );
    this.cache = new CacheService(cfg.cacheTtl ?? 300);
  }

  // ─── Low-level fetch ───────────────────────────────────────────────────────

  /**
   * Core fetch wrapper with:
   * - Rate limiting (token bucket)
   * - In-memory caching
   * - In-flight request deduplication
   * - Retry on 429 / 5xx with exponential back-off
   * - Configurable timeout via AbortSignal
   */
  private async _fetch<T>(path: string, params: RawParams): Promise<T> {
    // Build URL
    const url = new URL(`${this.baseUrl}${path}`);
    applyParams(url, params);

    // Cache lookup
    const cacheKey = CacheService.buildKey(path, params);
    const cached = this.cache.get<T>(cacheKey);
    if (cached !== undefined) {
      logger.debug({ cacheKey }, "cache hit");
      return cached;
    }

    // In-flight deduplication: register the promise BEFORE any await so
    // concurrent callers for the same resource share one network request.
    const existing = this._inflight.get(cacheKey) as Promise<T> | undefined;
    if (existing) {
      logger.debug({ cacheKey }, "deduplicating in-flight request");
      return existing;
    }

    const promise = this._executeRequest<T>(url, cacheKey);
    this._inflight.set(cacheKey, promise as Promise<unknown>);
    try {
      return await promise;
    } finally {
      this._inflight.delete(cacheKey);
    }
  }

  private async _executeRequest<T>(url: URL, cacheKey: string): Promise<T> {
    // Acquire rate-limit token before issuing the real request
    await this.rateLimiter.acquire();

    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (attempt > 0) {
        // Exponential back-off: 500 ms, 1 s, 2 s, …
        const backoffMs = Math.min(500 * 2 ** (attempt - 1), 8_000);
        logger.debug({ attempt, backoffMs, url: url.toString() }, "retrying");
        await sleep(backoffMs);
      }

      let res: Response;
      try {
        res = await fetch(url.toString(), {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(this.timeout),
        });
      } catch (err) {
        lastError = new NetworkError(err);
        logger.warn({ err, attempt }, "fetch network error");
        // Network errors are retried like 5xx
        if (attempt < this.maxRetries) continue;
        throw lastError;
      }

      // 429 — respect Retry-After if present
      if (res.status === 429) {
        const retryAfterSec = parseInt(
          res.headers.get("Retry-After") ?? "1",
          10
        );
        const waitMs = Number.isFinite(retryAfterSec)
          ? retryAfterSec * 1000
          : 1_000;
        logger.warn({ waitMs, attempt }, "rate limited by upstream (429)");
        await sleep(waitMs);
        lastError = new OpenAIREError(429, await res.text().catch(() => ""));
        continue;
      }

      // 5xx — retry
      if (res.status >= 500) {
        lastError = new OpenAIREError(res.status, await res.text().catch(() => ""));
        logger.warn({ status: res.status, attempt }, "upstream server error");
        if (attempt < this.maxRetries) continue;
        throw lastError;
      }

      // 4xx (other than 429) — don't retry
      if (!res.ok) {
        throw new OpenAIREError(res.status, await res.text().catch(() => ""));
      }

      // Success
      const data = (await res.json()) as T;

      // Log upstream rate-limit info for observability
      const used = res.headers.get("x-ratelimit-used");
      const limit = res.headers.get("x-ratelimit-limit");
      if (used && limit) {
        logger.debug({ used, limit }, "upstream rate-limit headers");
      }

      this.cache.set(cacheKey, data);
      return data;
    }

    throw lastError ?? new OpenAIREError(0, "Max retries exceeded");
  }

  // ─── Research Products ─────────────────────────────────────────────────────

  async searchResearchProducts(
    params: ResearchProductSearchParams
  ): Promise<PaginatedResponse<ResearchProduct>> {
    const query = buildResearchProductQuery(params);
    const raw = await this._fetch<PaginatedResponse<unknown>>(
      PATHS.researchProducts,
      query
    );
    return {
      header: raw.header,
      results: raw.results.map(normalizeResearchProduct),
    };
  }

  async getResearchProduct(id: string): Promise<ResearchProduct> {
    const raw = await this._fetch<unknown>(
      `${PATHS.researchProducts}/${encodeURIComponent(id)}`,
      {}
    );
    return normalizeResearchProduct(raw);
  }

  // ─── Organizations ─────────────────────────────────────────────────────────

  async searchOrganizations(
    params: OrganizationSearchParams
  ): Promise<PaginatedResponse<Organization>> {
    const query = buildOrganizationQuery(params);
    const raw = await this._fetch<PaginatedResponse<unknown>>(
      PATHS.organizations,
      query
    );
    return {
      header: raw.header,
      results: raw.results.map(normalizeOrganization),
    };
  }

  async getOrganization(id: string): Promise<Organization> {
    const raw = await this._fetch<unknown>(
      `${PATHS.organizations}/${encodeURIComponent(id)}`,
      {}
    );
    return normalizeOrganization(raw);
  }

  // ─── Projects ──────────────────────────────────────────────────────────────

  async searchProjects(
    params: ProjectSearchParams
  ): Promise<PaginatedResponse<Project>> {
    const query = buildProjectQuery(params);
    const raw = await this._fetch<PaginatedResponse<unknown>>(
      PATHS.projects,
      query
    );
    return {
      header: raw.header,
      results: raw.results.map(normalizeProject),
    };
  }

  async getProject(id: string): Promise<Project> {
    const raw = await this._fetch<unknown>(
      `${PATHS.projects}/${encodeURIComponent(id)}`,
      {}
    );
    return normalizeProject(raw);
  }

  // ─── Cursor pagination ─────────────────────────────────────────────────────

  /**
   * Iterates cursor-based pages until exhausted or `maxPages` is reached.
   * Safety limit: 10 pages × 100 results = 1 000 records by default.
   *
   * @param onProgress Optional callback invoked after each page with
   *                   (fetched, total) counts.
   */
  async fetchAllPages<T>(
    endpoint: string,
    params: RawParams,
    maxPages = 10,
    onProgress?: (fetched: number, total: number) => void
  ): Promise<T[]> {
    const all: T[] = [];
    let cursor = "*";

    for (let page = 0; page < maxPages; page++) {
      const pageParams: RawParams = {
        ...params,
        cursor,
        pageSize: params["pageSize"] ?? "100",
      };

      const data = await this._fetch<PaginatedResponse<T>>(endpoint, pageParams);
      all.push(...data.results);

      const header = data.header as CursorHeader & { numFound: number };
      onProgress?.(all.length, header.numFound ?? 0);

      const nextCursor = (data.header as Partial<CursorHeader>).nextCursor;
      if (!nextCursor || data.results.length === 0) break;

      cursor = nextCursor;
    }

    return all;
  }
}

// ─── Singleton factory ────────────────────────────────────────────────────────

let _instance: OpenAIREClient | null = null;

/** Get or create the shared OpenAIREClient instance. */
export function getOpenAIREClient(cfg?: OpenAIREClientConfig): OpenAIREClient {
  if (!_instance) {
    if (!cfg) throw new Error("OpenAIREClient not yet initialised — pass config on first call");
    _instance = new OpenAIREClient(cfg);
  }
  return _instance;
}

/** Replace the singleton (useful for testing). */
export function setOpenAIREClient(client: OpenAIREClient): void {
  _instance = client;
}
