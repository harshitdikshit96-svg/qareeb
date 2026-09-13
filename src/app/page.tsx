import HomeClient from "@/components/HomeClient";
import { getMasjidsWithFallback } from "@/lib/masjidsRepo";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { masjids, stale, fetchedAt } = await getMasjidsWithFallback();
  return <HomeClient masjids={masjids} stale={stale} fetchedAt={fetchedAt} />;
}
