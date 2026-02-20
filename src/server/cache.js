// src/server/cache.js
// Simple TTL-based in-memory cache for serverless functions.
// Returns stale data as fallback when Boulevard API errors.

const store = new Map();

/**
 * Get a cached value by key.
 * @returns {{ data: any, stale: boolean } | null}
 */
export function getCached(key, ttlMs = 120_000) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts < ttlMs) return { data: entry.data, stale: false };
  return { data: entry.data, stale: true };
}

/**
 * Store a value in cache.
 */
export function setCache(key, data) {
  store.set(key, { data, ts: Date.now() });
  // Evict oldest entries when map gets too large
  if (store.size > 500) {
    const oldest = [...store.entries()]
      .sort((a, b) => a[1].ts - b[1].ts)
      .slice(0, 100);
    oldest.forEach(([k]) => store.delete(k));
  }
}
