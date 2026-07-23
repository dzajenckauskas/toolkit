/**
 * Sprint 001 scope constants for the Image Optimizer.
 *
 * The first vertical slice is deliberately narrow: one JPEG in, one
 * optimized JPEG out. PNG and WebP are intentionally excluded until a
 * later sprint (see docs/sprints/sprint-001-foundation.md).
 */

/** The only input format accepted in Sprint 001. */
export const ACCEPTED_MIME_TYPES = ['image/jpeg'] as const;

/** File extensions matched as a fallback when a browser omits the MIME type. */
export const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg'] as const;

/** Reject files above this size before attempting to decode them. */
export const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB

/**
 * The single "balanced" JPEG quality used for the one-default slice.
 * Range is 0..1 as expected by HTMLCanvasElement.toBlob.
 */
export const BALANCED_JPEG_QUALITY = 0.8;

/** Output filename suffix inserted before the extension. */
export const OUTPUT_SUFFIX = 'optimized';
