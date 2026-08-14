"use client";

import { useEffect, useState } from "react";
import MasjidCard from "@/components/MasjidCard";
import { getBookmarks } from "@/lib/bookmarks";
import { getAllMasjids, withDistances } from "@/lib/masjids";
import { useGeolocation } from "@/lib/useGeolocation";

export default function BookmarksPage() {
  const [ids, setIds] = useState<string[] | null>(null);
  const { coords } = useGeolocation();

  useEffect(() => {
    const sync = () => setIds(getBookmarks());
    const kickoff = setTimeout(sync, 0);
    window.addEventListener("qareeb:bookmarks-changed", sync);
    return () => {
      clearTimeout(kickoff);
      window.removeEventListener("qareeb:bookmarks-changed", sync);
    };
  }, []);

  const masjids = withDistances(
    getAllMasjids().filter((m) => ids?.includes(m.id)),
    coords
  );

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <header>
        <h1 className="text-2xl font-semibold">Bookmarks</h1>
        <p className="text-muted text-sm mt-1">Masjids you&apos;ve saved</p>
      </header>

      {ids !== null && masjids.length === 0 && (
        <p className="text-sm text-muted">
          No bookmarks yet. Tap the heart on a masjid card to save it here.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {masjids.map((m) => (
          <MasjidCard key={m.id} masjid={m} />
        ))}
      </div>
    </div>
  );
}
