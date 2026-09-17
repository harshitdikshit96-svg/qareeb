/**
 * Injects Cloudinary delivery transformations (auto format/quality, and
 * optionally a max width) into a stored secure_url, so the browser
 * requests a right-sized WebP/AVIF instead of the original upload.
 * Cuts both page weight and Cloudinary bandwidth — meaningful once
 * there are thousands of masjids' photos being served repeatedly.
 * Non-Cloudinary URLs are returned unchanged.
 */
export function cloudinaryUrl(url: string, width?: number): string {
  const marker = "/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  const transforms = ["f_auto", "q_auto"];
  if (width) transforms.push(`w_${width}`);

  return url.slice(0, idx + marker.length) + transforms.join(",") + "/" + url.slice(idx + marker.length);
}
