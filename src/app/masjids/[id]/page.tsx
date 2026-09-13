import Link from "next/link";
import { notFound } from "next/navigation";
import MasjidGallery from "@/components/MasjidGallery";
import StaleBanner from "@/components/StaleBanner";
import { googleMapsDirectionsUrl } from "@/lib/masjids";
import { getMasjidByIdWithFallback } from "@/lib/masjidsRepo";
import { PRAYER_LABELS } from "@/lib/prayer";
import type { PrayerName } from "@/lib/types";

const ROW_ORDER: PrayerName[] = ["fajr", "zohar", "asr", "maghrib", "isha"];

// Note: this page is force-dynamic (rendered per-request from the DB), so
// there is no generateStaticParams here — it was a leftover from the
// original static-JSON build and was making an unprotected extra DB call
// (bypassing the retry/stale-cache fallback) on every single visit.
export const dynamic = "force-dynamic";

export default async function MasjidDetailPage({
  params,
}: PageProps<"/masjids/[id]">) {
  const { id } = await params;
  const { masjid, stale } = await getMasjidByIdWithFallback(id);
  if (!masjid) notFound();

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      {stale && <StaleBanner fetchedAt={null} />}
      <Link href="/masjids" className="inline-flex items-center gap-1 text-sm text-muted">
        <BackIcon />
        All Masjids
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
        <DirectionIcon />
        Get Directions
      </a>

      <section className="bg-card rounded-2xl border border-black/5 divide-y divide-black/5">
        {ROW_ORDER.map((name) => (
          <div key={name} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm">{PRAYER_LABELS[name]}</span>
            <span className="text-sm font-medium">{masjid.timings[name]}</span>
          </div>
        ))}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm">Jumu&apos;ah</span>
          <span className="text-sm font-medium">{masjid.timings.jummah}</span>
        </div>
      </section>

      {masjid.geoPrecision === "locality" && (
        <p className="text-xs text-muted">
          Location shown is approximate (locality-level), pending exact
          verification.
        </p>
      )}

      <p className="text-xs text-muted">
        Timings last updated {masjid.lastUpdated}. Report a correction if you
        notice an error.
      </p>
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}

function DirectionIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11 21 3l-8 18-2-8-8-2Z" />
    </svg>
  );
}
