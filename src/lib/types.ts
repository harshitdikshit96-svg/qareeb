export type PrayerName = "fajr" | "zohar" | "asr" | "maghrib" | "isha";

export type PrayerTimes = {
  fajr: string;
  zohar: string;
  asr: string;
  maghrib: string;
  isha: string;
  jummah: string;
};

export type Masjid = {
  id: string;
  name: string;
  area: string;
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
  geoPrecision: "exact" | "locality" | null;
  verified: boolean;
  timings: PrayerTimes;
  lastUpdated: string;
};

export type MasjidWithDistance = Masjid & { distanceKm: number | null };
