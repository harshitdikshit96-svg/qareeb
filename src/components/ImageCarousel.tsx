"use client";

import { useState } from "react";

export default function ImageCarousel({
  images,
  alt,
  onImageClick,
  rootClassName = "absolute inset-0",
  arrowSize = "h-7 w-7",
  showDots = true,
  initialIndex = 0,
  fit = "cover",
}: {
  images: string[];
  alt: string;
  onImageClick?: (index: number) => void;
  rootClassName?: string;
  arrowSize?: string;
  showDots?: boolean;
  initialIndex?: number;
  fit?: "cover" | "contain";
}) {
  const [index, setIndex] = useState(initialIndex);

  if (images.length === 0) return null;
  const safeIndex = Math.min(index, images.length - 1);

  function goPrev(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i - 1 + images.length) % images.length);
  }

  function goNext(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i + 1) % images.length);
  }

  return (
    <div className={rootClassName}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[safeIndex]}
        alt={alt}
        onClick={
          onImageClick
            ? (e) => {
                e.preventDefault();
                e.stopPropagation();
                onImageClick(safeIndex);
              }
            : undefined
        }
        className={`h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"} ${
          onImageClick ? "cursor-zoom-in" : ""
        }`}
      />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous photo"
            className={`absolute left-1.5 top-1/2 -translate-y-1/2 z-10 ${arrowSize} rounded-full bg-black/35 hover:bg-black/55 text-white flex items-center justify-center backdrop-blur-sm transition-colors`}
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next photo"
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 z-10 ${arrowSize} rounded-full bg-black/35 hover:bg-black/55 text-white flex items-center justify-center backdrop-blur-sm transition-colors`}
          >
            <ChevronRightIcon />
          </button>

          {showDots && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === safeIndex ? "w-3 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
