"use client";

import { useMemo, useState } from "react";
import MasjidCard from "@/components/MasjidCard";
import SearchFilterBar from "@/components/SearchFilterBar";
import { getAllMasjids, getAreas, sortByDistance, withDistances } from "@/lib/masjids";
import { useGeolocation } from "@/lib/useGeolocation";

export default function MasjidsPage() {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<string | null>(null);
  const { coords, status } = useGeolocation();

  const masjids = useMemo(() => getAllMasjids(), []);
  const areas = useMemo(() => getAreas(masjids), [masjids]);

  const sorted = useMemo(
    () => sortByDistance(withDistances(masjids, coords)),
    [masjids, coords]
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
      <header>
        <h1 className="text-2xl font-semibold">All Masjids</h1>
        <p className="text-muted text-sm mt-1">
          {status === "granted"
            ? "Sorted by distance from you"
            : "Enable location to sort by distance"}
        </p>
      </header>

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
