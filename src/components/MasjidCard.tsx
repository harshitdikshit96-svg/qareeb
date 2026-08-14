"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isBookmarked, toggleBookmark } from "@/lib/bookmarks";
import { formatDistance } from "@/lib/distance";
import { googleMapsDirectionsUrl } from "@/lib/masjids";
import { getNextPrayer } from "@/lib/prayer";
import type { MasjidWithDistance } from "@/lib/types";

export default function MasjidCard({ masjid }: { masjid: MasjidWithDistance }) {
  const [bookmarked, setBookmarked] = useState(false);
  const next = getNextPrayer(masjid.timings);

  useEffect(() => {
    const kickoff = setTimeout(() => setBookmarked(isBookmarked(masjid.id)), 0);
    return () => clearTimeout(kickoff);
  }, [masjid.id]);

  return (
    <div className="relative h-full rounded-2xl bg-card shadow-sm overflow-hidden border border-black/5">
      <div className="relative h-28 bg-gradient-to-br from-brand to-brand-light flex items-center justify-center">
        {masjid.distanceKm !== null && (
          <span className="absolute top-2 left-2 rounded-full bg-brand/80 text-white text-xs font-medium px-2.5 py-1">
            {formatDistance(masjid.distanceKm)}
          </span>
        )}
        <button
          type="button"
          onClick={() => setBookmarked(toggleBookmark(masjid.id))}
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
          className="absolute z-10 top-2 right-2 h-7 w-7 rounded-full bg-white/90 flex items-center justify-center"
        >
          <HeartIcon filled={bookmarked} />
        </button>
        <MosqueIcon />
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm leading-tight truncate">{masjid.name}</p>
        <p className="text-muted text-xs mt-0.5 truncate">
          {masjid.area}, {masjid.city}
        </p>
        <div className="flex items-center justify-between mt-2.5">
          {next && (
            <span className="text-xs text-brand font-medium">
              Next: {next.label} {next.timeLabel}
            </span>
          )}
          <a
            href={googleMapsDirectionsUrl(masjid)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Get directions"
            className="relative z-10 h-7 w-7 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0"
          >
            <DirectionIcon />
          </a>
        </div>
      </div>
      <Link
        href={`/masjids/${masjid.id}`}
        aria-label={masjid.name}
        className="absolute inset-0 z-0"
      />
    </div>
  );
}

function MosqueIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeOpacity="0.85" strokeWidth="1.4">
      <path d="M12 2c1.2 1.2 1.6 2.3.9 3.6C14.6 6.3 15.5 7.3 15.5 8.5H8.5c0-1.2.9-2.2 1.6-2.9C9.4 4.3 10.8 3.2 12 2Z" />
      <path d="M3 21v-6a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v6" />
      <path d="M16 21v-6a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v6" />
      <path d="M8.5 8.5V21h7V8.5" />
      <path d="M2 21h20" />
      <path d="M11 13.5a1 1 0 1 1 2 0v2.5h-2v-2.5Z" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={filled ? "#d9a441" : "none"}
      stroke={filled ? "#d9a441" : "#123832"}
      strokeWidth="2"
    >
      <path d="M12 21s-7.5-4.6-10-9.3C.5 8.3 2.3 5 5.6 5 8 5 9.7 6.6 12 9c2.3-2.4 4-4 6.4-4 3.3 0 5.1 3.3 3.6 6.7C19.5 16.4 12 21 12 21Z" />
    </svg>
  );
}

function DirectionIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11 21 3l-8 18-2-8-8-2Z" />
    </svg>
  );
}
