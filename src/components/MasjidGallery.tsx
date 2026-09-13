"use client";

import { useEffect, useState } from "react";
import ImageCarousel from "@/components/ImageCarousel";

export default function MasjidGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxIndex(null);
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxIndex]);

  if (images.length === 0) {
    return (
      <div className="relative rounded-3xl bg-gradient-to-br from-brand to-brand-light h-32 flex items-center justify-center overflow-hidden">
        <MosqueIcon />
      </div>
    );
  }

  return (
    <>
      <ImageCarousel
        images={images}
        alt={alt}
        onImageClick={(index) => setLightboxIndex(index)}
        rootClassName="relative rounded-3xl h-56 overflow-hidden bg-gradient-to-br from-brand to-brand-light"
        arrowSize="h-8 w-8"
      />

      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} photos`}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close"
            className="absolute top-4 right-4 z-20 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm"
          >
            <CloseIcon />
          </button>
          <div
            className="relative h-full w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <ImageCarousel
              images={images}
              alt={alt}
              initialIndex={lightboxIndex}
              fit="contain"
              arrowSize="h-9 w-9"
            />
          </div>
        </div>
      )}
    </>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6 18 18M18 6 6 18" />
    </svg>
  );
}

function MosqueIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeOpacity="0.85" strokeWidth="1.4">
      <path d="M12 2c1.2 1.2 1.6 2.3.9 3.6C14.6 6.3 15.5 7.3 15.5 8.5H8.5c0-1.2.9-2.2 1.6-2.9C9.4 4.3 10.8 3.2 12 2Z" />
      <path d="M3 21v-6a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v6" />
      <path d="M16 21v-6a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v6" />
      <path d="M8.5 8.5V21h7V8.5" />
      <path d="M2 21h20" />
      <path d="M11 13.5a1 1 0 1 1 2 0v2.5h-2v-2.5Z" />
    </svg>
  );
}
