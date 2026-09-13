import "server-only";
import type { Masjid } from "./types";

type CacheEntry = { data: Masjid[]; fetchedAt: number };

// Module-level, so it persists across requests for as long as this server
// process stays warm (works for `next start` and warm serverless
// instances). This is intentionally simple — it's a last-known-good
// fallback, not a distributed cache.
let cache: CacheEntry | null = null;

export function setCachedMasjids(data: Masjid[]) {
  cache = { data, fetchedAt: Date.now() };
}

export function getCachedMasjids(): CacheEntry | null {
  return cache;
}
