"use client";

import { useEffect, useMemo, useState } from "react";
import ImageCarousel from "@/components/ImageCarousel";
import { MosqueIcon, CloseIcon } from "@/components/icons";
import { cloudinaryUrl } from "@/lib/cloudinaryUrl";

export default function MasjidGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Inline gallery only needs a card-sized image; the lightbox needs a
  // much bigger one. Requesting the right size (rather than the raw
  // upload) cuts page weight and Cloudinary bandwidth.
  const galleryImages = useMemo(() => images.map((src) => cloudinaryUrl(src, 800)), [images]);
  const lightboxImages = useMemo(() => images.map((src) => cloudinaryUrl(src, 1600)), [images]);

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
        <MosqueIcon size={48} />
      </div>
    );
  }

  return (
    <>
      <ImageCarousel
        images={galleryImages}
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
              images={lightboxImages}
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
