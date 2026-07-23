import { OUTPUT_SUFFIX } from './constants';

/**
 * Build the download filename for an optimized image.
 *
 * "photo.jpg"        -> "photo-optimized.jpg"
 * "photo.JPEG"       -> "photo-optimized.JPEG" (original extension preserved)
 * "my.photo.v2.jpg"  -> "my.photo.v2-optimized.jpg" (only the last dot splits)
 * "noext"            -> "noext-optimized.jpg" (default extension added)
 */
export function generateOutputFilename(inputName: string, suffix: string = OUTPUT_SUFFIX): string {
  const trimmed = inputName.trim();
  const safeName = trimmed.length > 0 ? trimmed : 'image';

  const lastDot = safeName.lastIndexOf('.');
  // Treat a leading dot (e.g. ".gitignore") or no dot as "no extension".
  const hasExtension = lastDot > 0;

  const base = hasExtension ? safeName.slice(0, lastDot) : safeName;
  const extension = hasExtension ? safeName.slice(lastDot) : '.jpg';

  return `${base}-${suffix}${extension}`;
}
