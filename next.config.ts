import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  experimental: {
    serverActions: {
      // Client compresses photos to WebP before uploading, but this is a
      // safety net for large originals / older browsers without
      // OffscreenCanvas support that fall back to the raw file.
      bodySizeLimit: "15mb",
    },
  },
  async headers() {
    return [
      {
        // Never let a browser/CDN cache the service worker file itself —
        // otherwise an updated sw.js (new CACHE_NAME, fixed fetch logic)
        // can take up to 24h to reach clients per the PWA guide.
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
