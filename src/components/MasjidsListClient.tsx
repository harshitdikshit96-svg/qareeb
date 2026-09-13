"use client";

import { useMemo, useState } from "react";
import MasjidCard from "@/components/MasjidCard";
import SearchFilterBar from "@/components/SearchFilterBar";
import SortToggle, { type SortMode } from "@/components/SortToggle";
import StaleBanner from "@/components/StaleBanner";
import { getAreas, sortByDistance, withDistances } from "@/lib/masjids";
import { getNextPrayer } from "@/lib/prayer";
import { useGeolocation } from "@/lib/useGeolocation";
import type { Masjid, MasjidWithDistance } from "@/lib/types";

function sortByNextPrayer(masjids: MasjidWithDistance[]): MasjidWithDistance[] {
  const now = new Date();
  return [...masjids].sort((a, b) => {
    const aMs = getNextPrayer(a.timings, now)?.remainingMs ?? Infinity;
    const bMs = getNextPrayer(b.timings, now)?.remainingMs ?? Infinity;
    return aMs - bMs;
  });
}

export default function MasjidsListClient({
  masjids,
  stale = false,
  fetchedAt = null,
}: {
  masjids: Masjid[];
  stale?: boolean;
  fetchedAt?: number | null;
}) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("distance");
  const { coords, status } = useGeolocation();

  const areas = useMemo(() => getAreas(masjids), [masjids]);

  const withDist = useMemo(() => withDistances(masjids, coords), [masjids, coords]);

  const sorted = useMemo(
    () =>
      sortMode === "distance"
        ? sortByDistance(withDist)
        : sortByNextPrayer(withDist),
    [withDist, sortMode]
  );

  const filtered = useMemo(
    () =>
      sorted.filter((m) => {
        const matchesQuery = `${m.name} ${m.area}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesArea = area === null || m.area === area;
        return matchesQuery && matchesArea;
      }),
    [sorted, query, area]
  );

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      {stale && <StaleBanner fetchedAt={fetchedAt} />}
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">All Masjids</h1>
          <p className="text-muted text-sm mt-1">
            {sortMode === "distance"
              ? status === "granted"
                ? "Sorted by distance from you"
                : "Enable location to sort by distance"
              : "Sorted by nearest upcoming jamaat"}
          </p>
        </div>
      </header>

      <SortToggle
        value={sortMode}
        onChange={setSortMode}
        distanceDisabled={status !== "granted"}
      />

      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        areas={areas}
        selectedArea={area}
        onAreaChange={setArea}
      />

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((m) => (
          <MasjidCard key={m.id} masjid={m} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 text-sm text-muted py-6 text-center">
            No masjids match your search.
          </p>
        )}
      </div>
    </div>
  );
}
