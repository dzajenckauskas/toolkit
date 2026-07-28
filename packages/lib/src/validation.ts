import { ACCEPTED_EXTENSIONS, ACCEPTED_MIME_TYPES, MAX_FILE_BYTES } from './constants';

export type ValidationErrorCode = 'empty' | 'unsupported-type' | 'too-large';

export interface ValidationResult {
  ok: boolean;
  code?: ValidationErrorCode;
  message?: string;
}

/**
 * A minimal, structurally-typed view of the parts of `File` we need.
 * Keeping this narrow makes the function trivially unit-testable in jsdom
 * without constructing real File objects everywhere.
 */
export interface FileLike {
  name: string;
  type: string;
  size: number;
}

function hasAcceptedExtension(name: string): boolean {
  const lower = name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/**
 * Validate a candidate upload for the Sprint 001 optimizer slice.
 *
 * Accepts only JPEG (by MIME type, falling back to extension when a browser
 * reports an empty type), rejects empty and oversized files, and returns a
 * human-readable message suitable for direct display.
 */
export function validateFile(file: FileLike): ValidationResult {
  if (file.size <= 0) {
    return {
      ok: false,
      code: 'empty',
      message: 'This file is empty. Choose a JPEG image and try again.',
    };
  }

  const typeAccepted = (ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type);
  // Some browsers report an empty MIME type for drag-and-drop; fall back to the extension.
  const extensionAccepted = file.type === '' && hasAcceptedExtension(file.name);

  if (!typeAccepted && !extensionAccepted) {
    return {
      ok: false,
      code: 'unsupported-type',
      message: 'Only JPEG images are supported right now. PNG and WebP are coming later.',
    };
  }

  if (file.size > MAX_FILE_BYTES) {
    const limitMb = Math.round(MAX_FILE_BYTES / (1024 * 1024));
    return {
      ok: false,
      code: 'too-large',
      message: `This image is larger than the ${limitMb} MB limit for now. Try a smaller JPEG.`,
    };
  }

  return { ok: true };
}
