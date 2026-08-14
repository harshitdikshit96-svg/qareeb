import type { PrayerName, PrayerTimes } from "./types";

const DAILY_ORDER: PrayerName[] = ["fajr", "zohar", "asr", "maghrib", "isha"];

export const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: "Fajr",
  zohar: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

/** Parses a "h:mm AM/PM" string against a given base date, returning a Date on that day. */
function parseTimeOnDate(time: string, base: Date): Date | null {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  const result = new Date(base);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export type NextPrayer = {
  name: PrayerName;
  label: string;
  time: Date;
  timeLabel: string;
  remainingMs: number;
};

/** Finds the next upcoming prayer (fajr/dhuhr/asr/maghrib/isha) from `now`, wrapping to tomorrow's Fajr if past Isha. */
export function getNextPrayer(
  timings: PrayerTimes,
  now: Date = new Date()
): NextPrayer | null {
  const todayCandidates = DAILY_ORDER.map((name) => ({
    name,
    time: parseTimeOnDate(timings[name], now),
  })).filter(
    (c): c is { name: PrayerName; time: Date } => c.time !== null && c.time > now
  );

  if (todayCandidates.length > 0) {
    const next = todayCandidates[0];
    return {
      name: next.name,
      label: PRAYER_LABELS[next.name],
      time: next.time,
      timeLabel: timings[next.name],
      remainingMs: next.time.getTime() - now.getTime(),
    };
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const fajrTomorrow = parseTimeOnDate(timings.fajr, tomorrow);
  if (!fajrTomorrow) return null;
  return {
    name: "fajr",
    label: PRAYER_LABELS.fajr,
    time: fajrTomorrow,
    timeLabel: timings.fajr,
    remainingMs: fajrTomorrow.getTime() - now.getTime(),
  };
}

export function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function isFriday(now: Date = new Date()): boolean {
  return now.getDay() === 5;
}
