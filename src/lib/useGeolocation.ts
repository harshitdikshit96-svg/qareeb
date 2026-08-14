"use client";

import { useEffect, useState } from "react";

type GeoState = {
  coords: { lat: number; lng: number } | null;
  status: "idle" | "loading" | "granted" | "denied" | "unsupported";
  place: string | null;
};

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ coords: null, status: "idle", place: null });

  useEffect(() => {
    const kickoff = setTimeout(() => {
      if (!("geolocation" in navigator)) {
        setState({ coords: null, status: "unsupported", place: null });
        return;
      }
      setState((s) => ({ ...s, status: "loading" }));
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setState({ coords, status: "granted", place: null });
          reverseGeocode(coords).then((place) => {
            if (place) setState((s) => ({ ...s, place }));
          });
        },
        () => {
          setState({ coords: null, status: "denied", place: null });
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
      );
    }, 0);
    return () => clearTimeout(kickoff);
  }, []);

  return state;
}

async function reverseGeocode(coords: { lat: number; lng: number }): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.lat}&longitude=${coords.lng}&localityLanguage=en`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const parts = [data.locality, data.city].filter(
      (v, i, arr) => v && arr.indexOf(v) === i
    );
    if (parts.length) return parts.join(", ");
    return data.principalSubdivision || data.countryName || null;
  } catch {
    return null;
  }
}
