"use client";

import { useEffect, useState } from "react";
import { haversineKm } from "@/lib/distance";

type Coords = { lat: number; lng: number };

type GeoState = {
  coords: Coords | null;
  status: "idle" | "loading" | "granted" | "denied" | "unavailable" | "unsupported";
  place: string | null;
};

// Ignore position jitter below this — re-sorting the list on every GPS wobble
// is wasted work and makes the "nearest" card flicker.
const MIN_MOVE_KM = 0.05;
// Reverse geocoding hits a third-party API, so only refresh the place label
// once the user has actually moved to a different neighbourhood.
const REGEOCODE_KM = 0.5;

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ coords: null, status: "idle", place: null });

  useEffect(() => {
    let watchId: number | null = null;
    let lastCoords: Coords | null = null;
    let lastGeocoded: Coords | null = null;
    let cancelled = false;

    const onPosition = (pos: GeolocationPosition) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      if (
        lastCoords &&
        haversineKm(lastCoords.lat, lastCoords.lng, coords.lat, coords.lng) < MIN_MOVE_KM
      ) {
        return;
      }
      lastCoords = coords;
      setState((s) => ({ ...s, coords, status: "granted" }));

      if (
        !lastGeocoded ||
        haversineKm(lastGeocoded.lat, lastGeocoded.lng, coords.lat, coords.lng) >= REGEOCODE_KM
      ) {
        lastGeocoded = coords;
        reverseGeocode(coords).then((place) => {
          if (place && !cancelled) setState((s) => ({ ...s, place }));
        });
      }
    };

    const onError = (err: GeolocationPositionError) => {
      // Only a real permission denial counts as "denied". In the TWA the
      // Android permission dialog is shown while the request's timeout is
      // already ticking, and a phone with device Location switched off
      // reports POSITION_UNAVAILABLE — neither means the user said no, so
      // they get their own status and the watch keeps trying. A known fix
      // is kept through transient errors.
      if (err.code === err.PERMISSION_DENIED) {
        lastCoords = null;
        setState({ coords: null, status: "denied", place: null });
      } else if (!lastCoords) {
        setState((s) => ({ ...s, status: "unavailable" }));
      }
    };

    const options: PositionOptions = { enableHighAccuracy: false, timeout: 15000, maximumAge: 60 * 1000 };

    const startWatch = () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      watchId = navigator.geolocation.watchPosition(onPosition, onError, options);
    };

    // The app (especially as a TWA) can sit in the background for hours and
    // resume without remounting, and the user may have just granted location
    // in system settings — so restart the watch whenever the app comes back
    // to the foreground. That both forces a fresh reading and recovers from
    // an earlier denial (a denied watch never fires again on its own).
    const onVisible = () => {
      if (document.visibilityState === "visible") startWatch();
    };

    let permission: PermissionStatus | null = null;
    const onPermissionChange = () => {
      if (permission?.state === "granted") startWatch();
    };

    const kickoff = setTimeout(() => {
      if (!("geolocation" in navigator)) {
        setState({ coords: null, status: "unsupported", place: null });
        return;
      }
      setState((s) => ({ ...s, status: "loading" }));
      startWatch();
      document.addEventListener("visibilitychange", onVisible);
      navigator.permissions
        ?.query({ name: "geolocation" })
        .then((p) => {
          if (cancelled) return;
          permission = p;
          p.addEventListener("change", onPermissionChange);
        })
        .catch(() => {});
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(kickoff);
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      document.removeEventListener("visibilitychange", onVisible);
      permission?.removeEventListener("change", onPermissionChange);
    };
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
