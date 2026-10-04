"use client";

import Image from "next/image";
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
        className="relative overflow-hidden rounded-3xl p-5 space-y-3"
        style={{
          // Gradient-only fallback now — it's what paints instantly behind
          // the <Image> below while that loads, instead of being layered
          // underneath a second (invisible-to-the-browser) background
          // image request.
          backgroundImage: "linear-gradient(135deg, var(--brand) 0%, var(--brand-light) 100%)",
        }}
      >
        {/* This was a CSS background-image before, which is exactly the
            anti-pattern that was causing the slow LCP: Chrome DOES count a
            background-image as an LCP candidate (it isn't invisible to the
            metric), but fetchpriority/loading hints can ONLY be set on a
            real <img>/<link> element, never via the style attribute — so a
            background-image can never be told to load eagerly or with
            priority, no matter what else on the page changes. A real
            next/image here also gets an automatic WebP re-encode (the
            source PNG was 322 KiB for a 643x360 image) plus a priority
            preload tag, instead of shipping the raw PNG as-is. */}
        <Image
          src="/images/hero-bg.png"
          alt=""
          aria-hidden="true"
          fill
          // NOT `priority` (deprecated in Next 16 in favor of `preload`) and
          // NOT `preload` either — Next's own docs say explicitly: when you
          // want fetchPriority, use loading="eager" + fetchPriority="high"
          // directly rather than preload. This is also what Lighthouse's
          // "LCP request discovery" audit checks for specifically: a plain
          // preload link without fetchpriority="high" set on the <img>
          // itself still fails that check.
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 448px) 448px, 100vw"
          className="object-cover"
        />
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
          {filtered.slice(0, 6).map((m, i) => (
            <div key={m.id} className="snap-start snap-always w-64 shrink-0">
              {/* Only the first card's image is almost certainly the page's
                  LCP element (first visible photo, above the fold). Every
                  card's image was defaulting to loading="lazy" — including
                  this one — which was the actual LCP root cause: the
                  browser's lazy-load scheduler was deferring the fetch of
                  the very image Lighthouse was measuring LCP against. */}
              <MasjidCard masjid={m} priority={i === 0} />
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
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="rtl:-scale-x-100"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}
