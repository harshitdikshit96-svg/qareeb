import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import { after } from "next/server";
import type { Metadata } from "next";
import MasjidGallery from "@/components/MasjidGallery";
import { BackIcon, DirectionIcon } from "@/components/icons";
import StaleBanner from "@/components/StaleBanner";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { googleMapsDirectionsUrl } from "@/lib/masjids";
import { getMasjidByIdWithFallback } from "@/lib/masjidsRepo";
import { recordVisit } from "@/lib/analytics";
import { VISITOR_COOKIE_NAME } from "@/lib/visitorCookie";
import type { PrayerName } from "@/lib/types";

const ROW_ORDER: PrayerName[] = ["fajr", "zohar", "asr", "maghrib", "isha"];

// Note: this page is force-dynamic (rendered per-request from the DB), so
// there is no generateStaticParams here — it was a leftover from the
// original static-JSON build and was making an unprotected extra DB call
// (bypassing the retry/stale-cache fallback) on every single visit.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/masjids/[id]">): Promise<Metadata> {
  const { id } = await params;
  const { masjid } = await getMasjidByIdWithFallback(id);
  if (!masjid) return {};

  const title = `${masjid.name} — Prayer Timings | Qareeb`;
  const description = `Jamaat timings for ${masjid.name}, ${masjid.area}, ${masjid.city}. Fajr ${masjid.timings.fajr}, Dhuhr ${masjid.timings.zohar}, Asr ${masjid.timings.asr}, Maghrib ${masjid.timings.maghrib}, Isha ${masjid.timings.isha}.`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function MasjidDetailPage({
  params,
}: PageProps<"/masjids/[id]">) {
  const { id } = await params;
  const [{ masjid, stale }, locale] = await Promise.all([
    getMasjidByIdWithFallback(id),
    getLocale(),
  ]);
  if (!masjid) notFound();
  const dict = getDictionary(locale);

  const [cookieStore, hdrs] = await Promise.all([cookies(), headers()]);
  const visitorId = cookieStore.get(VISITOR_COOKIE_NAME)?.value ?? null;
  const referrer = hdrs.get("referer");
  const userAgent = hdrs.get("user-agent");
  const host = hdrs.get("host");
  after(() => recordVisit({ visitorId, masjidId: id, referrer, userAgent, host }));

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
