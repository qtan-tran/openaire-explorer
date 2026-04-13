import NodeCache from "node-cache";

/**
 * Optional interface for a future Redis adapter.
 * Implement and inject into CacheService to swap backends.
 */
export interface CacheAdapter {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T, ttlSeconds?: number): void;
  del(key: string): void;
  flush(): void;
}

/** In-memory cache backed by node-cache. */
export class CacheService implements CacheAdapter {
  private readonly store: NodeCache;
  private readonly defaultTtl: number;

  constructor(ttlSeconds = 300) {
    this.defaultTtl = ttlSeconds;
    this.store = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: Math.max(60, Math.floor(ttlSeconds * 0.2)),
      useClones: false, // avoid deep-clone overhead on reads
    });
  }

  get<T>(key: string): T | undefined {
    return this.store.get<T>(key);
  }

  set<T>(key: string, value: T, ttlSeconds?: number): void {
    this.store.set(key, value, ttlSeconds ?? this.defaultTtl);
  }

  del(key: string): void {
    this.store.del(key);
  }

  flush(): void {
    this.store.flushAll();
  }

  get stats() {
    return this.store.getStats();
  }

  /**
   * Deterministic cache key from an endpoint path + params object.
   * Params are sorted alphabetically so param ordering doesn't create duplicate keys.
   */
  static buildKey(
    endpoint: string,
    params: Record<string, string | number | boolean | null | undefined>
  ): string {
    const parts = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    return parts.length > 0 ? `${endpoint}?${parts.join("&")}` : endpoint;
  }
}
