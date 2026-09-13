import { deleteMasjidPhotoAction } from "@/lib/adminActions";
import PhotoUploader from "./PhotoUploader";

export default function PhotoManager({
  masjidId,
  images,
}: {
  masjidId: string;
  images: string[];
}) {
  return (
    <div className="rounded-xl border border-black/10 p-4 space-y-4">
      <p className="text-sm font-medium">Photos</p>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((src) => {
            const deleteAction = deleteMasjidPhotoAction.bind(null, masjidId, src);
            return (
              <div key={src} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="h-24 w-full object-cover rounded-lg border border-black/10"
                />
                <form action={deleteAction} className="absolute top-1 right-1">
                  <button
                    type="submit"
                    className="h-6 w-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center"
                    aria-label="Delete photo"
                  >
                    ✕
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}

      {images.length === 0 && (
        <p className="text-xs text-neutral-500">No photos yet.</p>
      )}

      <PhotoUploader masjidId={masjidId} />
    </div>
  );
}
