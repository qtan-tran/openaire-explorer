/**
 * Token-bucket rate limiter.
 *
 * Tokens refill at `refillRate` per second up to `capacity`.
 * `acquire()` takes one token; callers that find the bucket empty
 * are queued and resolved in FIFO order as tokens become available.
 */
export class TokenBucketRateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  /** tokens per millisecond */
  private readonly refillRateMs: number;
  private readonly pending: Array<() => void> = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * @param capacity   Max burst size (tokens in bucket at start)
   * @param ratePerSec Steady-state rate in requests per second
   */
  constructor(capacity: number, ratePerSec: number) {
    this.capacity = capacity;
    this.refillRateMs = ratePerSec / 1000;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  /** Returns current token count (for observability / tests). */
  get available(): number {
    this._refill();
    return this.tokens;
  }

  /** Acquire one token. Resolves immediately if a token is available, otherwise waits. */
  acquire(): Promise<void> {
    this._refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.pending.push(resolve);
      this._scheduleFlush();
    });
  }

  private _refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRateMs);
    this.lastRefill = now;
  }

  private _scheduleFlush(): void {
    if (this.flushTimer !== null) return;

    // Time until at least 1 token is available
    const waitMs = Math.max(1, Math.ceil((1 - this.tokens) / this.refillRateMs));

    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this._refill();

      while (this.tokens >= 1 && this.pending.length > 0) {
        this.tokens -= 1;
        const resolve = this.pending.shift()!;
        resolve();
      }

      if (this.pending.length > 0) {
        this._scheduleFlush();
      }
    }, waitMs);
  }
}
