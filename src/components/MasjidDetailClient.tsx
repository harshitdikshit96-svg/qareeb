"use client";

import Link from "next/link";
import MasjidGallery from "@/components/MasjidGallery";
import { BackIcon, DirectionIcon } from "@/components/icons";
import StaleBanner from "@/components/StaleBanner";
import { useDictionary } from "@/lib/i18n/LocaleContext";
import { googleMapsDirectionsUrl } from "@/lib/masjids";
import type { Masjid, PrayerName } from "@/lib/types";

const ROW_ORDER: PrayerName[] = ["fajr", "zohar", "asr", "maghrib", "isha"];

// Split out of the page component (which stays a Server Component for the
// data fetch + notFound()/generateMetadata) so the translated strings can
// go through useDictionary() / LocaleProvider instead of a server-side
// getLocale() call — see the comment on LocaleProvider for why. "use
// client" here does NOT mean this renders only in the browser: Next still
// server-renders it to HTML for the initial request (masjid.name, the
// gallery, timings are all in the first response same as before), it just
// also hydrates, which is what lets it self-correct its locale.
export default function MasjidDetailClient({
  masjid,
  stale,
}: {
  masjid: Masjid;
  stale: boolean;
}) {
  const dict = useDictionary();

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      {stale && <StaleBanner fetchedAt={null} />}
      <Link href="/masjids" className="inline-flex items-center gap-1 text-sm text-muted">
        <BackIcon size={16} />
        {dict.common.allMasjids}
      </Link>

      <MasjidGallery images={masjid.images} alt={masjid.name} />

      <header>
        <h1 className="text-2xl font-semibold leading-tight">{masjid.name}</h1>
        <p className="text-muted text-sm mt-1">{masjid.address}</p>
      </header>

      <a
        href={googleMapsDirectionsUrl(masjid)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-brand text-white rounded-2xl py-3 text-sm font-medium"
      >
        <DirectionIcon size={16} />
        {dict.masjidDetail.getDirections}
      </a>

      <section className="bg-card rounded-2xl border border-black/5 divide-y divide-black/5">
        {ROW_ORDER.map((name) => (
          <div key={name} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm">{dict.prayerLabels[name]}</span>
            <span className="text-sm font-medium">
              <bdi>{masjid.timings[name]}</bdi>
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm">{dict.prayerFilterLabels.jummah}</span>
          <span className="text-sm font-medium">
            <bdi>{masjid.timings.jummah}</bdi>
          </span>
        </div>
      </section>

      {masjid.geoPrecision === "locality" && (
        <p className="text-xs text-muted">{dict.masjidDetail.approximateLocation}</p>
      )}

      <p className="text-xs text-muted">{dict.masjidDetail.lastUpdated(masjid.lastUpdated)}</p>
    </div>
  );
}
