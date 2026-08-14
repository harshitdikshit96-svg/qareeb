import masjidsData from "../../data/masjids.json";
import { haversineKm } from "./distance";
import type { Masjid, MasjidWithDistance } from "./types";

export function getAllMasjids(): Masjid[] {
  return masjidsData as Masjid[];
}

export function getMasjidById(id: string): Masjid | undefined {
  return getAllMasjids().find((m) => m.id === id);
}

export function withDistances(
  masjids: Masjid[],
  origin: { lat: number; lng: number } | null
): MasjidWithDistance[] {
  return masjids.map((m) => ({
    ...m,
    distanceKm:
      origin && m.lat !== null && m.lng !== null
        ? haversineKm(origin.lat, origin.lng, m.lat, m.lng)
        : null,
  }));
}

export function sortByDistance(
  masjids: MasjidWithDistance[]
): MasjidWithDistance[] {
  return [...masjids].sort((a, b) => {
    if (a.distanceKm === null && b.distanceKm === null) return 0;
    if (a.distanceKm === null) return 1;
    if (b.distanceKm === null) return -1;
    return a.distanceKm - b.distanceKm;
  });
}

export function getAreas(masjids: Masjid[]): string[] {
  return Array.from(new Set(masjids.map((m) => m.area))).sort();
}

export function googleMapsDirectionsUrl(m: Masjid): string {
  if (m.lat !== null && m.lng !== null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${m.name}, ${m.address}`
  )}`;
}
