"use client";

import { useEffect, useState } from "react";
import { useDictionary } from "@/lib/i18n/LocaleContext";
import { formatCountdown, getNextPrayer } from "@/lib/prayer";
import type { PrayerName, PrayerTimes } from "@/lib/types";

const ROW_ORDER: PrayerName[] = ["fajr", "zohar", "asr", "maghrib", "isha"];

export default function NextPrayerBanner({
  timings,
  sourceLabel,
}: {
  timings: PrayerTimes;
  sourceLabel?: string;
}) {
  const [now, setNow] = useState<Date | null>(null);
  const dict = useDictionary();

  useEffect(() => {
    const tick = () => setNow(new Date());
    const kickoff = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);
    return () => {
      clearTimeout(kickoff);
      clearInterval(interval);
    };
  }, []);

  if (!now) {
    return (
      <div className="rounded-3xl bg-brand h-[180px] animate-pulse" aria-hidden />
    );
  }

  const next = getNextPrayer(timings, now);

  return (
    <div className="rounded-3xl bg-brand text-white p-5 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-white/70 text-sm">{dict.nextPrayerBanner.nextPrayer(sourceLabel)}</p>
          {next && (
            <>
              <p className="text-3xl font-semibold mt-1">{dict.prayerLabels[next.name]}</p>
              <p className="text-xl text-white/90 mt-0.5">{next.timeLabel}</p>
              <p className="flex items-center gap-1.5 text-sm text-white/70 mt-2">
                <ClockIcon />
                {dict.nextPrayerBanner.remaining(formatCountdown(next.remainingMs))}
              </p>
            </>
          )}
        </div>
        <a
          href="https://qiblafinder.withgoogle.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 bg-white/10 hover:bg-white/15 transition-colors rounded-2xl px-4 py-3 text-sm shrink-0"
        >
          <CompassIcon />
          <span className="text-center leading-tight whitespace-pre-line">
            {dict.nextPrayerBanner.qiblaFinder.replace(" ", "\n")}
          </span>
        </a>
      </div>

      <div className="mt-4 pt-4 border-t border-white/15 grid grid-cols-5 gap-1.5">
        {ROW_ORDER.map((name) => {
          const isActive = next?.name === name;
          return (
            <div
              key={name}
              className={`flex flex-col items-center gap-0.5 rounded-xl py-2 text-xs ${
                isActive ? "bg-white text-brand font-semibold" : "text-white/80"
              }`}
            >
              <span>{dict.prayerLabels[name]}</span>
              <span className="text-[11px]">{timings[name]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="m14.5 9.5-1.8 5.2-5.2 1.8 1.8-5.2 5.2-1.8Z" />
    </svg>
  );
}
