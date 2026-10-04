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

  // Bare q_auto defaults to Cloudinary's "good" quality tier, which is
  // why it wasn't enough on its own — q_auto:eco steps down one tier
  // (more compression, still perceptually fine at the ~400px these only
  // ever render at) and is what actually moves the needle Lighthouse's
  // "Improve image delivery" audit was still flagging after f_auto alone.
  const transforms = ["f_auto", "q_auto:eco"];
  if (width) transforms.push(`w_${width}`);

  return url.slice(0, idx + marker.length) + transforms.join(",") + "/" + url.slice(idx + marker.length);
}
