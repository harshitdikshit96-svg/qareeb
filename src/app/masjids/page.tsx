import MasjidsListClient from "@/components/MasjidsListClient";
import { getMasjidsWithFallback } from "@/lib/masjidsRepo";

// No cookies()/headers()/after() here anymore — visit tracking moved to
// src/proxy.ts (middleware), which doesn't force this route into dynamic
// rendering. getMasjidsWithFallback() is already cached (unstable_cache,
// revalidated by revalidateTag("masjids")), so with that gone this page
// can be fully static / ISR'd instead of rebuilt on every request.
export default async function MasjidsPage() {
  const { masjids, stale, fetchedAt } = await getMasjidsWithFallback();

  return <MasjidsListClient masjids={masjids} stale={stale} fetchedAt={fetchedAt} />;
}
