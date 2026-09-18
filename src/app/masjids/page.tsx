import { cookies, headers } from "next/headers";
import { after } from "next/server";
import MasjidsListClient from "@/components/MasjidsListClient";
import { getMasjidsWithFallback } from "@/lib/masjidsRepo";
import { recordVisit } from "@/lib/analytics";
import { VISITOR_COOKIE_NAME } from "@/lib/visitorCookie";

export const dynamic = "force-dynamic";

export default async function MasjidsPage() {
  const { masjids, stale, fetchedAt } = await getMasjidsWithFallback();

  const [cookieStore, hdrs] = await Promise.all([cookies(), headers()]);
  const visitorId = cookieStore.get(VISITOR_COOKIE_NAME)?.value ?? null;
  const referrer = hdrs.get("referer");
  const userAgent = hdrs.get("user-agent");
  const host = hdrs.get("host");
  after(() => recordVisit({ visitorId, referrer, userAgent, host }));

  return <MasjidsListClient masjids={masjids} stale={stale} fetchedAt={fetchedAt} />;
}
