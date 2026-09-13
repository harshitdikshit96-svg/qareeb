import BookmarksClient from "@/components/BookmarksClient";
import { getMasjidsWithFallback } from "@/lib/masjidsRepo";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const { masjids, stale, fetchedAt } = await getMasjidsWithFallback();
  return <BookmarksClient masjids={masjids} stale={stale} fetchedAt={fetchedAt} />;
}
