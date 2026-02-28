// src/lib/rateLimit.js
// Lightweight in-memory sliding window rate limiter for Vercel serverless.
// Each serverless instance gets its own Map, so limits are per-instance
// (which is fine — it catches bots/abuse without blocking genuine users).

const stores = new Map();

/**
 * Create a rate limiter with the given limits.
 * @param {string} name - Unique name for this limiter (e.g. 'checkout')
 * @param {number} maxRequests - Maximum requests allowed in the window
 * @param {number} windowMs - Window size in milliseconds (default: 60_000 = 1 min)
 * @returns {(key: string) => { allowed: boolean, remaining: number, retryAfterMs: number }}
 */
export function createRateLimiter(name, maxRequests, windowMs = 60_000) {
  if (!stores.has(name)) stores.set(name, new Map());
  const store = stores.get(name);

  // Clean expired entries periodically (every 5 min)
  if (!store._cleanupSet) {
    store._cleanupSet = true;
    setInterval(() => {
      const now = Date.now();
      for (const [key, timestamps] of store) {
        const valid = timestamps.filter((t) => now - t < windowMs);
        if (valid.length === 0) store.delete(key);
        else store.set(key, valid);
      }
    }, 300_000).unref?.();
  }

  return function checkLimit(key) {
    const now = Date.now();
    const timestamps = (store.get(key) || []).filter((t) => now - t < windowMs);

    if (timestamps.length >= maxRequests) {
      const oldest = timestamps[0];
      const retryAfterMs = windowMs - (now - oldest);
      return { allowed: false, remaining: 0, retryAfterMs };
    }

    timestamps.push(now);
    store.set(key, timestamps);
    return { allowed: true, remaining: maxRequests - timestamps.length, retryAfterMs: 0 };
  };
}

/**
 * Get the client IP from a Next.js API request.
 */
export function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Helper to apply rate limiting to an API handler.
 * Returns 429 if rate limit exceeded, otherwise returns null (proceed).
 */
// ── Pre-configured tier limiters ──
export const rateLimiters = {
  tight:    createRateLimiter('tight', 5, 60_000),      // 5/min  — forms, OTP, claims
  moderate: createRateLimiter('moderate', 20, 60_000),   // 20/min — provider/service lookups
  loose:    createRateLimiter('loose', 30, 60_000),      // 30/min — availability reads
  otpHour:  createRateLimiter('otpHour', 15, 3_600_000), // 15/hr  — OTP hourly cap
}

export function applyRateLimit(req, res, limiter, key) {
  const result = limiter(key);
  if (!result.allowed) {
    res.setHeader('Retry-After', Math.ceil(result.retryAfterMs / 1000));
    res.status(429).json({
      error: 'Too many requests. Please wait a moment and try again.',
      retryAfterMs: result.retryAfterMs,
    });
    return true; // blocked
  }
  return false; // allowed
}
