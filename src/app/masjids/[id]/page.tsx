import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MasjidDetailClient from "@/components/MasjidDetailClient";
import { getMasjidByIdWithFallback } from "@/lib/masjidsRepo";

// No cookies()/headers()/after()/getLocale() here anymore — visit/view-count
// tracking moved to src/proxy.ts (middleware, keyed off the id in the URL),
// and translated text moved to MasjidDetailClient (reads locale via
// LocaleProvider client-side instead of a server-side cookie read). Both
// were independently forcing this route into per-request dynamic
// rendering. getMasjidByIdWithFallback() is already cached (unstable_cache,
// revalidated by revalidateTag("masjids")), so on first visit to a given
// id Next renders once and caches the result (dynamicParams defaults to
// true) instead of re-querying on every request.

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
  const { masjid, stale } = await getMasjidByIdWithFallback(id);
  if (!masjid) notFound();

  return <MasjidDetailClient masjid={masjid} stale={stale} />;
}
