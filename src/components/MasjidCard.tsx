"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ImageCarousel from "@/components/ImageCarousel";
import { MosqueIcon, HeartIcon, DirectionIcon } from "@/components/icons";
import { cloudinaryUrl } from "@/lib/cloudinaryUrl";
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

  const cardImages = useMemo(
    () => masjid.images.map((src) => cloudinaryUrl(src, 400)),
    [masjid.images]
  );

  return (
    <div className="relative h-full rounded-2xl bg-card shadow-sm overflow-hidden border border-black/5">
      <div className="relative h-28 bg-gradient-to-br from-brand to-brand-light flex items-center justify-center overflow-hidden">
        {masjid.images.length > 0 ? (
          <ImageCarousel
            images={cardImages}
            alt={masjid.name}
            arrowSize="h-6 w-6"
            showDots={false}
          />
        ) : (
          <MosqueIcon />
        )}
        {masjid.distanceKm !== null && (
          <span className="absolute top-2 left-2 z-10 rounded-full bg-brand/80 text-white text-xs font-medium px-2.5 py-1">
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

