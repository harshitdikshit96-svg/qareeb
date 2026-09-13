import MasjidsListClient from "@/components/MasjidsListClient";
import { getMasjidsWithFallback } from "@/lib/masjidsRepo";

export const dynamic = "force-dynamic";

export default async function MasjidsPage() {
  const { masjids, stale, fetchedAt } = await getMasjidsWithFallback();
  return <MasjidsListClient masjids={masjids} stale={stale} fetchedAt={fetchedAt} />;
}
