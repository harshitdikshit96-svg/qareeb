"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import InstallPrompt from "@/components/InstallPrompt";
import MasjidCard from "@/components/MasjidCard";
import NextPrayerBanner from "@/components/NextPrayerBanner";
import SearchFilterBar from "@/components/SearchFilterBar";
import StaleBanner from "@/components/StaleBanner";
import { useDictionary } from "@/lib/i18n/LocaleContext";
import { getAreas, sortByDistance, withDistances } from "@/lib/masjids";
import { useGeolocation } from "@/lib/useGeolocation";
import type { Masjid } from "@/lib/types";

export default function HomeClient({
  masjids,
  stale = false,
  fetchedAt = null,
}: {
  masjids: Masjid[];
  stale?: boolean;
  fetchedAt?: number | null;
}) {
  const [query, setQuery] = useState("");
  const { coords, status, place } = useGeolocation();
  const dict = useDictionary();

  const areas = useMemo(() => getAreas(masjids), [masjids]);

  const sorted = useMemo(
    () => sortByDistance(withDistances(masjids, coords)),
    [masjids, coords]
  );

  const filtered = useMemo(
    () =>
      sorted.filter((m) =>
        `${m.name} ${m.area}`.toLowerCase().includes(query.toLowerCase())
      ),
    [sorted, query]
  );

  const bannerSource = sorted[0];

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <InstallPrompt />
      {stale && <StaleBanner fetchedAt={fetchedAt} />}
      <header
        className="relative overflow-hidden rounded-3xl p-5 space-y-3 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/images/hero-bg.png'), linear-gradient(135deg, var(--brand) 0%, var(--brand-light) 100%)",
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative">
          <h1 className="text-3xl font-semibold leading-tight text-white">
            {dict.home.greetingLine1}
            <br />
            {dict.home.greetingLine2}
          </h1>
          <p className="text-white/80 text-sm mt-2">{dict.home.tagline}</p>
        </div>
        <div className="relative inline-flex items-center gap-1.5 bg-card border border-black/10 rounded-full px-3.5 py-1.5 text-sm">
          <PinIcon />
          {dict.home.locationBadge}
        </div>
      </header>

      {bannerSource && (
        <NextPrayerBanner
          timings={bannerSource.timings}
          sourceLabel={
            status === "granted"
              ? `${dict.home.nearestPrefix} · ${bannerSource.name}`
              : bannerSource.name
          }
        />
      )}

      {status === "denied" && (
        <p className="text-xs text-muted -mt-2">{dict.home.locationDenied}</p>
      )}

      {status === "granted" && (
        <p className="text-xs text-muted -mt-2">
          {place ? dict.home.locationGranted(place) : dict.home.findingArea}
        </p>
      )}

      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        areas={areas}
        selectedArea={null}
        onAreaChange={() => {}}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{dict.home.nearbyMasjids}</h2>
          <Link href="/masjids" className="text-sm text-brand flex items-center gap-0.5">
            {dict.home.viewAll}
            <ChevronIcon />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-1 snap-x scroll-pl-4 scroll-pr-4">
          {filtered.slice(0, 6).map((m) => (
            <div key={m.id} className="snap-start snap-always w-64 shrink-0">
              <MasjidCard masjid={m} />
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted py-6">{dict.common.noMasjidsMatch}</p>
          )}
        </div>
      </section>
    </div>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}
