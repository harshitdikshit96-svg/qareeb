import "server-only";
import { v2 as cloudinary } from "cloudinary";

let configured = false;

function ensureConfigured() {
  if (configured) return;

  // Cloudinary's SDK auto-reads CLOUDINARY_URL (cloudinary://<key>:<secret>@<cloud_name>)
  // when config() is called with no args, so support either that single
  // variable or the three separate ones.
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
    configured = true;
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_URL, or CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET, in .env.local."
    );
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  configured = true;
}

/** Uploads one photo to Cloudinary under qareeb/masjids/<masjidId>/ and returns its secure URL. */
export async function uploadMasjidPhoto(
  masjidId: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  ensureConfigured();
  const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `qareeb/masjids/${masjidId}`,
    resource_type: "image",
  });
  return result.secure_url;
}

/** Deletes a photo from Cloudinary given its secure URL (as returned by uploadMasjidPhoto). */
export async function deleteMasjidPhotoByUrl(url: string): Promise<void> {
  ensureConfigured();
  const publicId = publicIdFromUrl(url);
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

function publicIdFromUrl(url: string): string | null {
  // e.g. https://res.cloudinary.com/<cloud>/image/upload/v1234567890/qareeb/masjids/<id>/<name>.jpg
  // -> "qareeb/masjids/<id>/<name>"
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+(?:\?.*)?$/);
  return match ? match[1] : null;
}
