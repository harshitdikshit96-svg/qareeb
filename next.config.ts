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
};

export default nextConfig;
