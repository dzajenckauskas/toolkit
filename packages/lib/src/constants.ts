/**
 * Shared constants for the image tools. Accepted input formats live in
 * `image.ts` (`ACCEPTED_IMAGE_MIME` / `ACCEPTED_IMAGE_EXTENSIONS`), which every
 * image tool now uses.
 */

/** Reject files above this size before attempting to decode them. */
export const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB

/**
 * The "balanced" quality used when re-encoding lossy formats (JPEG/WebP).
 * Range is 0..1 as expected by HTMLCanvasElement.toBlob.
 */
export const BALANCED_JPEG_QUALITY = 0.8;
