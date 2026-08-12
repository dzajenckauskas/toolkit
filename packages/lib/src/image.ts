/**
 * Shared image helpers for the resize / convert / rotate tools.
 *
 * The geometry and format helpers here are pure and unit-tested. The canvas
 * rendering functions are browser-only (they touch document/canvas) and are
 * exercised by the Playwright suite, mirroring `optimize.ts`.
 */

import { decodeImage, ImageEncodeError } from './optimize';
import { MAX_FILE_BYTES } from './constants';

/** Raster formats the image tools accept as input. */
export const ACCEPTED_IMAGE_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
] as const;

export const ACCEPTED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.bmp',
] as const;

export interface ImageFileLike {
  name: string;
  type: string;
  size: number;
}

export interface ImageValidation {
  ok: boolean;
  message?: string;
}

/** Validate an image upload for the resize/convert/rotate tools. */
export function validateImageFile(file: ImageFileLike): ImageValidation {
  if (file.size <= 0) {
    return { ok: false, message: 'This file is empty. Choose an image and try again.' };
  }
  const lower = file.name.toLowerCase();
  const typeOk = (ACCEPTED_IMAGE_MIME as readonly string[]).includes(file.type);
  const extOk = file.type === '' && ACCEPTED_IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
  if (!typeOk && !extOk) {
    return { ok: false, message: 'Unsupported image type. Try JPG, PNG, WebP, GIF or BMP.' };
  }
  if (file.size > MAX_FILE_BYTES) {
    const limitMb = Math.round(MAX_FILE_BYTES / (1024 * 1024));
    return { ok: false, message: `This image is larger than the ${limitMb} MB limit.` };
  }
  return { ok: true };
}

export type ImageFormat = 'jpeg' | 'png' | 'webp';

export const IMAGE_FORMATS: ImageFormat[] = ['jpeg', 'png', 'webp'];

export function mimeFor(format: ImageFormat): string {
  return `image/${format}`;
}

export function extensionFor(format: ImageFormat): string {
  return format === 'jpeg' ? 'jpg' : format;
}

/** Build a download name: "photo.png" + ("resized","jpg") -> "photo-resized.jpg". */
export function outputImageName(inputName: string, suffix: string, ext: string): string {
  const trimmed = inputName.trim() || 'image';
  const lastDot = trimmed.lastIndexOf('.');
  const base = lastDot > 0 ? trimmed.slice(0, lastDot) : trimmed;
  return `${base}-${suffix}.${ext}`;
}

/** True when the format encodes with a lossy quality parameter. */
export function isLossy(format: ImageFormat): boolean {
  return format === 'jpeg' || format === 'webp';
}

/**
 * The output format to use for an input, preserving it where the canvas can
 * re-encode it. JPEG/PNG/WebP round-trip as themselves; anything else the
 * browser can decode but not encode (GIF, BMP, unknown) falls back to PNG,
 * which is lossless and keeps any transparency. Uses the MIME type, falling
 * back to the file extension when the browser reports an empty type.
 */
export function imageFormatForInput(type: string, name = ''): ImageFormat {
  const lower = name.toLowerCase();
  if (type === 'image/jpeg' || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'jpeg';
  if (type === 'image/webp' || lower.endsWith('.webp')) return 'webp';
  return 'png';
}

/**
 * True when the format supports an alpha channel. JPEG has none, so drawing a
 * transparent source onto a JPEG-bound canvas would let the encoder fill the
 * transparent pixels with black. Callers use this to paint a background first.
 */
export function formatHasAlpha(format: ImageFormat): boolean {
  return format !== 'jpeg';
}

/** Background painted behind transparent pixels when the target has no alpha. */
export const DEFAULT_IMAGE_BACKGROUND = '#ffffff';

export interface Size {
  width: number;
  height: number;
}

/** Clamp to at least 1×1 integer pixels. */
export function clampSize({ width, height }: Size): Size {
  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
  };
}

/**
 * Given the original size and a new value for one dimension, return the size
 * that preserves the original aspect ratio.
 */
export function lockAspect(original: Size, edited: Partial<Size>): Size {
  const ratio = original.width / original.height;
  if (edited.width !== undefined) {
    return clampSize({ width: edited.width, height: edited.width / ratio });
  }
  if (edited.height !== undefined) {
    return clampSize({ width: edited.height * ratio, height: edited.height });
  }
  return clampSize(original);
}

/** Fit a size within max bounds, preserving aspect ratio (never upscales). */
export function fitWithin(size: Size, maxWidth: number, maxHeight: number): Size {
  const scale = Math.min(maxWidth / size.width, maxHeight / size.height, 1);
  return clampSize({ width: size.width * scale, height: size.height * scale });
}

/** Dimensions after rotating by a number of 90° quarter turns. */
export function rotateSize(size: Size, quarterTurns: number): Size {
  return Math.abs(quarterTurns % 2) === 1
    ? { width: size.height, height: size.width }
    : { ...size };
}

export interface Transform {
  quarterTurns: number; // clockwise 90° steps, 0..3
  flipH: boolean;
  flipV: boolean;
}

export const IDENTITY_TRANSFORM: Transform = { quarterTurns: 0, flipH: false, flipV: false };

export function rotateCW(t: Transform): Transform {
  return { ...t, quarterTurns: (t.quarterTurns + 1) % 4 };
}

export function rotateCCW(t: Transform): Transform {
  return { ...t, quarterTurns: (t.quarterTurns + 3) % 4 };
}

// --- Browser-only canvas rendering below ---

/**
 * Fill the canvas with a solid background before drawing, when the target
 * format has no alpha channel. Without this a transparent source exported to
 * JPEG comes out with a black background (the encoder's default fill).
 */
function fillBackgroundIfOpaque(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  format: ImageFormat,
  background: string,
): void {
  if (formatHasAlpha(format)) return;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function encodeCanvas(
  canvas: HTMLCanvasElement,
  format: ImageFormat,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new ImageEncodeError())),
      mimeFor(format),
      isLossy(format) ? quality : undefined,
    );
  });
}

/** Decode `input`, draw it at `target` size, and encode to `format`. */
export async function renderResized(
  input: Blob,
  target: Size,
  format: ImageFormat,
  quality = 0.9,
  background = DEFAULT_IMAGE_BACKGROUND,
): Promise<{ blob: Blob; size: Size }> {
  const { image } = await decodeImage(input);
  const size = clampSize(target);
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new ImageEncodeError();
  ctx.imageSmoothingQuality = 'high';
  fillBackgroundIfOpaque(ctx, canvas, format, background);
  ctx.drawImage(image, 0, 0, size.width, size.height);
  return { blob: await encodeCanvas(canvas, format, quality), size };
}

/** Decode `input`, crop to a source-pixel rectangle, and encode to `format`. */
export async function renderCropped(
  input: Blob,
  rect: { x: number; y: number; width: number; height: number },
  format: ImageFormat,
  quality = 0.9,
  background = DEFAULT_IMAGE_BACKGROUND,
): Promise<{ blob: Blob; size: Size }> {
  const { image } = await decodeImage(input);
  const size = clampSize({ width: rect.width, height: rect.height });
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new ImageEncodeError();
  ctx.imageSmoothingQuality = 'high';
  fillBackgroundIfOpaque(ctx, canvas, format, background);
  ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, size.width, size.height);
  return { blob: await encodeCanvas(canvas, format, quality), size };
}

/** Decode `input`, apply a rotate/flip transform, and encode to `format`. */
export async function renderTransformed(
  input: Blob,
  transform: Transform,
  format: ImageFormat,
  quality = 0.9,
  background = DEFAULT_IMAGE_BACKGROUND,
): Promise<{ blob: Blob; size: Size }> {
  const { image, width, height } = await decodeImage(input);
  const out = rotateSize({ width, height }, transform.quarterTurns);
  const canvas = document.createElement('canvas');
  canvas.width = out.width;
  canvas.height = out.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new ImageEncodeError();

  // Fill in untransformed pixel space, before translate/rotate/scale.
  fillBackgroundIfOpaque(ctx, canvas, format, background);
  ctx.translate(out.width / 2, out.height / 2);
  ctx.rotate((transform.quarterTurns * Math.PI) / 2);
  ctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);

  return { blob: await encodeCanvas(canvas, format, quality), size: out };
}

/**
 * Decode `input` and re-encode it at its native size to `format` (compression).
 * `quality` is applied only for lossy formats; lossless formats ignore it. Used
 * by the optimizer to compress in-place while preserving the source format.
 */
export async function optimizeImage(
  input: Blob,
  format: ImageFormat,
  quality: number,
  background = DEFAULT_IMAGE_BACKGROUND,
): Promise<{ blob: Blob; dimensions: Size }> {
  const { image, width, height } = await decodeImage(input);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new ImageEncodeError();
  fillBackgroundIfOpaque(ctx, canvas, format, background);
  ctx.drawImage(image, 0, 0, width, height);
  return { blob: await encodeCanvas(canvas, format, quality), dimensions: { width, height } };
}
