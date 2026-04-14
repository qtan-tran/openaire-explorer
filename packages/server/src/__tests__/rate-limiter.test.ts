import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { TokenBucketRateLimiter } from "../lib/rate-limiter.js";

describe("TokenBucketRateLimiter", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  test("resolves immediately when bucket has capacity", async () => {
    const limiter = new TokenBucketRateLimiter(5, 5);
    const resolved: number[] = [];
    const promises = Array.from({ length: 5 }, (_, i) =>
      limiter.acquire().then(() => resolved.push(i))
    );
    await Promise.all(promises);
    expect(resolved).toHaveLength(5);
  });

  test("acquire returns a Promise", () => {
    const limiter = new TokenBucketRateLimiter(2, 2);
    const result = limiter.acquire();
    expect(result).toBeInstanceOf(Promise);
  });

  test("queues requests beyond capacity", async () => {
    const limiter = new TokenBucketRateLimiter(1, 1); // capacity 1, 1 req/s
    let queuedResolved = false;

    const p1 = limiter.acquire(); // immediately resolves
    const p2 = limiter.acquire().then(() => { queuedResolved = true; }); // must wait

    await p1; // p1 is immediate
    expect(queuedResolved).toBe(false); // p2 not yet resolved

    vi.advanceTimersByTime(1100); // advance 1.1s to refill 1 token
    await p2;
    expect(queuedResolved).toBe(true);
  });

  test("queued requests are processed after token refill", async () => {
    const limiter = new TokenBucketRateLimiter(2, 2); // 2 tokens, 2 req/s
    const resolved: string[] = [];

    const p1 = limiter.acquire().then(() => resolved.push("p1")); // immediate
    const p2 = limiter.acquire().then(() => resolved.push("p2")); // immediate (2nd token)
    const p3 = limiter.acquire().then(() => resolved.push("p3")); // queued
    const p4 = limiter.acquire().then(() => resolved.push("p4")); // queued

    await Promise.all([p1, p2]); // both resolve immediately
    expect(resolved).toEqual(["p1", "p2"]);
    expect(resolved).not.toContain("p3");

    vi.advanceTimersByTime(600); // ~1.2 tokens refilled (2 req/s × 0.6s = 1.2)
    await p3;
    expect(resolved).toContain("p3");

    vi.advanceTimersByTime(600);
    await p4;
    expect(resolved).toContain("p4");
  });

  test("available getter reflects current token count", () => {
    const limiter = new TokenBucketRateLimiter(5, 5);
    expect(limiter.available).toBe(5);
  });

  test("available decreases after acquire", async () => {
    const limiter = new TokenBucketRateLimiter(5, 5);
    await limiter.acquire();
    expect(limiter.available).toBeCloseTo(4, 0);
  });

  test("tokens refill over time", () => {
    const limiter = new TokenBucketRateLimiter(1, 10); // 10 req/s
    void limiter.acquire(); // consumes the only token
    vi.advanceTimersByTime(200); // 0.2s × 10 req/s = 2 tokens
    expect(limiter.available).toBeGreaterThanOrEqual(1);
  });

  test("available never exceeds capacity", () => {
    const limiter = new TokenBucketRateLimiter(3, 100); // fast refill
    vi.advanceTimersByTime(10000); // 10s of refill time
    expect(limiter.available).toBeLessThanOrEqual(3);
  });

  test("high capacity allows burst requests without queueing", async () => {
    const limiter = new TokenBucketRateLimiter(10, 1);
    const results: number[] = [];
    const promises = Array.from({ length: 10 }, (_, i) =>
      limiter.acquire().then(() => results.push(i))
    );
    await Promise.all(promises);
    expect(results).toHaveLength(10);
  });
});
