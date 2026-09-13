"use client";

import { useRef, useState } from "react";
import { uploadMasjidPhotosAction } from "@/lib/adminActions";

const MAX_DIMENSION = 1600; // longest edge, px
const WEBP_QUALITY = 0.82;

type SelectedPhoto = { file: File; previewUrl: string };

/** Downscales + re-encodes an image to WebP client-side to keep uploads small. */
async function compressToWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY)
  );
  if (!blob) throw new Error("Compression produced no output");
  return blob;
}

export default function PhotoUploader({ masjidId }: { masjidId: string }) {
  const [selected, setSelected] = useState<SelectedPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const boundAction = uploadMasjidPhotosAction.bind(null, masjidId);

  function handleFilesChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const additions = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setSelected((prev) => [...prev, ...additions]);
    e.target.value = ""; // allow picking the same file again later
  }

  function removeSelected(index: number) {
    setSelected((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return copy;
    });
  }

  async function handleUploadClick() {
    if (selected.length === 0 || !hiddenInputRef.current || !formRef.current) {
      return;
    }
    setError(null);
    setIsPreparing(true);

    try {
      // Compress every selected photo, then load the results into the
      // form's real file input (via DataTransfer) and submit the form
      // natively — this is what lets Next.js's server-action wiring
      // (including the redirect on success) work exactly the same way it
      // does for a plain <form action={...}>, instead of us trying to
      // drive the action call ourselves.
      const dataTransfer = new DataTransfer();
      for (const { file } of selected) {
        const baseName = file.name.replace(/\.[^.]+$/, "");
        try {
          const webp = await compressToWebp(file);
          dataTransfer.items.add(
            new File([webp], `${baseName}.webp`, { type: "image/webp" })
          );
        } catch {
          // Fall back to the original file if compression fails
          // (e.g. an older browser without createImageBitmap/canvas support).
          dataTransfer.items.add(file);
        }
      }

      hiddenInputRef.current.files = dataTransfer.files;
      formRef.current.requestSubmit();
    } catch (err) {
      setIsPreparing(false);
      setError(err instanceof Error ? err.message : "Couldn't prepare photos for upload");
    }
  }

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleFilesChosen}
        disabled={isPreparing}
        className="text-xs"
      />

      {selected.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {selected.map((s, i) => (
            <div key={s.previewUrl} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.previewUrl}
                alt=""
                className="h-24 w-full object-cover rounded-lg border border-black/10"
              />
              <button
                type="button"
                onClick={() => removeSelected(i)}
                disabled={isPreparing}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center disabled:opacity-50"
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <form ref={formRef} action={boundAction}>
        <input ref={hiddenInputRef} type="file" name="photos" multiple hidden />
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={isPreparing || selected.length === 0}
          className="rounded-lg bg-emerald-700 text-white text-xs font-medium px-3 py-2 disabled:opacity-50"
        >
          {isPreparing
            ? "Preparing…"
            : `Upload ${selected.length > 0 ? selected.length : ""} photo${
                selected.length === 1 ? "" : "s"
              }`}
        </button>
      </form>
      <p className="text-[11px] text-neutral-400">
        Photos are resized and converted to WebP in your browser before
        upload to keep them small. Select multiple at once — you&apos;ll see
        previews here first.
      </p>
    </div>
  );
}
