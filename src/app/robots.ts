import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteConfig";

// Crawling (robots.txt) is separate from indexing (noindex meta) — this
// file only controls what Google is allowed to FETCH. _next/static and
// _next/image must stay allowed or Google can't render the page to assess
// mobile-friendliness and Core Web Vitals.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/_next/static/", "/_next/image"],
        disallow: [
          "/admin",
          "/admin/",
          "/masjid-admin",
          "/masjid-admin/",
          "/api/",
          "/_next/",
          "/profile",
          "/bookmarks",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
