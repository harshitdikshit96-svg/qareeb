import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteConfig";
import { getMasjidsWithFallback } from "@/lib/masjidsRepo";

// Every entry here is derived from the same data the routes render from
// (getMasjidsWithFallback) — a sitemap that lists a URL the app can't
// actually serve trains crawlers to distrust the whole file.
//
// No lastModified: new Date() anywhere. Claiming "this changed right now"
// on every deploy is worse than omitting lastModified entirely — Search
// Console starts ignoring lastmod once it catches a site lying about it.
// masjid.lastUpdated is a real per-record date, so that one is safe to use.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { masjids } = await getMasjidsWithFallback();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/masjids`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    // Intentionally excluded: /bookmarks and /profile are per-visitor
    // personal views with no shared content to index, and /admin,
    // /masjid-admin are private (also blocked in robots.ts).
  ];

  const masjidEntries: MetadataRoute.Sitemap = masjids.map((masjid) => ({
    url: `${SITE_URL}/masjids/${masjid.id}`,
    lastModified: masjid.lastUpdated ? new Date(masjid.lastUpdated) : undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...masjidEntries];
}
