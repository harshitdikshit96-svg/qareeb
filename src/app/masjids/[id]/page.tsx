import Link from "next/link";
import { notFound } from "next/navigation";
import StaleBanner from "@/components/StaleBanner";
import { googleMapsDirectionsUrl } from "@/lib/masjids";
import { getAllMasjidsFromDb } from "@/lib/masjidsDb";
import { getMasjidByIdWithFallback } from "@/lib/masjidsRepo";
import { PRAYER_LABELS } from "@/lib/prayer";
import type { PrayerName } from "@/lib/types";

const ROW_ORDER: PrayerName[] = ["fajr", "zohar", "asr", "maghrib", "isha"];

export async function generateStaticParams() {
  const masjids = await getAllMasjidsFromDb();
  return masjids.map((m) => ({ id: m.id }));
}

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

      <div className="relative rounded-3xl bg-gradient-to-br from-brand to-brand-light h-32 flex items-center justify-center overflow-hidden">
        {masjid.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={masjid.images[0]}
            alt={masjid.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <MosqueIcon />
        )}
      </div>

      <header>
        <h1 className="text-2xl font-semibold leading-tight">{masjid.name}</h1>
        <p className="text-muted text-sm mt-1">{masjid.address}</p>
      </header>

      {masjid.images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
          {masjid.images.slice(1).map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={masjid.name}
              className="h-20 w-20 shrink-0 rounded-xl object-cover border border-black/5"
            />
          ))}
        </div>
      )}

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

function MosqueIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeOpacity="0.85" strokeWidth="1.4">
      <path d="M12 2c1.2 1.2 1.6 2.3.9 3.6C14.6 6.3 15.5 7.3 15.5 8.5H8.5c0-1.2.9-2.2 1.6-2.9C9.4 4.3 10.8 3.2 12 2Z" />
      <path d="M3 21v-6a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v6" />
      <path d="M16 21v-6a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v6" />
      <path d="M8.5 8.5V21h7V8.5" />
      <path d="M2 21h20" />
      <path d="M11 13.5a1 1 0 1 1 2 0v2.5h-2v-2.5Z" />
    </svg>
  );
}
