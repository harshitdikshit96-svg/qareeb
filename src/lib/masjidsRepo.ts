import "server-only";
import { unstable_cache } from "next/cache";
import { getAllMasjidsFromDb, getMasjidByIdFromDb } from "./masjidsDb";
import { getCachedMasjids, setCachedMasjids } from "./masjidsCache";
import type { Masjid } from "./types";

export type MasjidsResult = {
  masjids: Masjid[];
  stale: boolean;
  fetchedAt: number | null;
};

// Public-facing reads go through this cache layer instead of hitting Neon
// on every request. It's invalidated immediately by revalidateTag("masjids")
// wherever an admin or sub-admin changes anything (see adminActions.ts /
// masjidAdminActions.ts / subAdminActions.ts), with a 1-hour revalidate as
// a safety net in case an invalidation is ever missed. This is the single
// biggest lever on DB read volume — without it, every visitor to every
// page triggers its own Neon query.
const CACHE_TAG = "masjids";
const CACHE_REVALIDATE_SECONDS = 3600;

const getAllMasjidsCached = unstable_cache(
  () => getAllMasjidsFromDb(),
  ["qareeb:masjids:all"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAG] }
);

const getMasjidByIdCached = unstable_cache(
  (id: string) => getMasjidByIdFromDb(id),
  ["qareeb:masjids:byId"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAG] }
);

/**
 * Fetches all masjids (via the cache above, which retries once on a
 * transient network error under the hood). If a cache miss still fails —
 * i.e. Neon itself is unreachable — and we have a previously-successful
 * result cached in memory, serve that instead of erroring the whole page,
 * with `stale: true` so the UI can say so. If we've never successfully
 * fetched, the error propagates to the nearest error boundary (error.tsx).
 */
export async function getMasjidsWithFallback(): Promise<MasjidsResult> {
  try {
    const masjids = await getAllMasjidsCached();
    setCachedMasjids(masjids);
    return { masjids, stale: false, fetchedAt: Date.now() };
  } catch (err) {
    const cached = getCachedMasjids();
    if (cached) {
      return { masjids: cached.data, stale: true, fetchedAt: cached.fetchedAt };
    }
    throw err;
  }
}

/**
 * Fetches one masjid by id with a targeted, cached query (not the whole
 * table). On failure, falls back to looking it up in the in-memory cache
 * of the last successful full-list fetch, if any.
 */
export async function getMasjidByIdWithFallback(
  id: string
): Promise<{ masjid: Masjid | null; stale: boolean }> {
  try {
    const masjid = await getMasjidByIdCached(id);
    return { masjid, stale: false };
  } catch (err) {
    const cached = getCachedMasjids();
    if (cached) {
      return { masjid: cached.data.find((m) => m.id === id) ?? null, stale: true };
    }
    throw err;
  }
}
