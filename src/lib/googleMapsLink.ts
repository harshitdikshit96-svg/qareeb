export type LatLng = { lat: number; lng: number };

/**
 * Try to pull lat/lng directly out of a Google Maps URL string.
 * Handles the common shapes:
 *   https://maps.google.com/?q=26.849,80.920
 *   https://www.google.com/maps?q=26.849,80.920
 *   https://www.google.com/maps/@26.849,80.920,17z
 *   https://www.google.com/maps/place/Name/@26.849,80.920,17z/...
 *   ...!3d26.849!4d80.920...   (place-detail encoded coords)
 * Returns null if it's a short link (maps.app.goo.gl, goo.gl/maps) that
 * needs to be resolved first, or if no coordinates are found.
 */
export function extractLatLngFromUrl(rawUrl: string): LatLng | null {
  const url = rawUrl.trim();
  if (!url) return null;

  // ?q=lat,lng or &q=lat,lng
  const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) {
    return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
  }

  // @lat,lng,zoom
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  }

  // !3dlat!4dlng (place-detail encoded)
  const bangMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (bangMatch) {
    return { lat: parseFloat(bangMatch[1]), lng: parseFloat(bangMatch[2]) };
  }

  // ll=lat,lng
  const llMatch = url.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (llMatch) {
    return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) };
  }

  return null;
}

export function isShortLink(rawUrl: string): boolean {
  return /maps\.app\.goo\.gl|goo\.gl\/maps/.test(rawUrl);
}

/**
 * Resolves short Google Maps links (maps.app.goo.gl / goo.gl/maps) by
 * following redirects, then extracts lat/lng from the final URL.
 * Server-side only (needs network fetch with redirect-following).
 */
export async function resolveAndExtractLatLng(
  rawUrl: string
): Promise<LatLng | null> {
  const direct = extractLatLngFromUrl(rawUrl);
  if (direct) return direct;

  if (!isShortLink(rawUrl)) return null;

  try {
    const res = await fetch(rawUrl, { redirect: "follow" });
    return extractLatLngFromUrl(res.url);
  } catch {
    return null;
  }
}
