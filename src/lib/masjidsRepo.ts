import "server-only";
import { getAllMasjidsFromDb, getMasjidByIdFromDb } from "./masjidsDb";
import { getCachedMasjids, setCachedMasjids } from "./masjidsCache";
import type { Masjid } from "./types";

export type MasjidsResult = {
  masjids: Masjid[];
  stale: boolean;
  fetchedAt: number | null;
};

/**
 * Fetches all masjids from the DB (which already retries once on a
 * transient network error). If that still fails and we have a
 * previously-successful result cached in memory, serve that instead of
 * erroring the whole page — with `stale: true` so the UI can say so.
 * If we have never successfully fetched yet, the error propagates to the
 * nearest error boundary (error.tsx).
 */
export async function getMasjidsWithFallback(): Promise<MasjidsResult> {
  try {
    const masjids = await getAllMasjidsFromDb();
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
 * Fetches one masjid by id with a targeted query (not the whole table).
 * On failure, falls back to looking it up in the in-memory cache of the
 * last successful full-list fetch, if any.
 */
export async function getMasjidByIdWithFallback(
  id: string
): Promise<{ masjid: Masjid | null; stale: boolean }> {
  try {
    const masjid = await getMasjidByIdFromDb(id);
    return { masjid, stale: false };
  } catch (err) {
    const cached = getCachedMasjids();
    if (cached) {
      return { masjid: cached.data.find((m) => m.id === id) ?? null, stale: true };
    }
    throw err;
  }
}
