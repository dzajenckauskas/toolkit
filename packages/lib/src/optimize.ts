import { BALANCED_JPEG_QUALITY } from './constants';

/**
 * Browser-local JPEG optimization via the Canvas API.
 *
 * Approach and limitations are documented in ADR-005 and
 * docs/technical/README.md. In short: decode -> draw to canvas ->
 * re-encode as JPEG at one balanced quality. No network, no dependencies,
 * no server. EXIF metadata is dropped by the canvas re-encode.
 *
 * This module is browser-only (it touches document/Image/canvas) and is
 * exercised by the Playwright suite rather than the jsdom unit tests.
 */

export interface DecodedDimensions {
  width: number;
  height: number;
}

export interface OptimizeResult {
  blob: Blob;
  dimensions: DecodedDimensions;
}

export class ImageDecodeError extends Error {
  constructor(message = 'This image could not be read. It may be corrupt or not a real JPEG.') {
    super(message);
    this.name = 'ImageDecodeError';
  }
}

export class ImageEncodeError extends Error {
  constructor(message = 'This image could not be optimized in your browser. Try another file.') {
    super(message);
    this.name = 'ImageEncodeError';
  }
}

/**
 * Load a Blob into an HTMLImageElement, resolving with the element and its
 * natural dimensions. Rejects with ImageDecodeError for anything the browser
 * cannot decode (corrupt data, wrong format masquerading as JPEG, etc.).
 *
 * The caller owns nothing here: the temporary object URL is always revoked.
 */
export function decodeImage(blob: Blob): Promise<{ image: HTMLImageElement } & DecodedDimensions> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();

    const cleanup = () => {
      URL.revokeObjectURL(url);
    };

    image.onload = () => {
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      cleanup();
      if (width === 0 || height === 0) {
        reject(new ImageDecodeError());
        return;
      }
      resolve({ image, width, height });
    };

    image.onerror = () => {
      cleanup();
      reject(new ImageDecodeError());
    };

    image.src = url;
  });
}

/**
 * Re-encode an already-decoded image to a JPEG Blob at the balanced quality.
 * Separated from decodeImage so a caller can reuse dimensions/preview without
 * decoding twice.
 */
export function encodeJpeg(
  image: HTMLImageElement,
  width: number,
  height: number,
  quality: number = BALANCED_JPEG_QUALITY,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      reject(new ImageEncodeError());
      return;
    }

    context.drawImage(image, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new ImageEncodeError());
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      quality,
    );
  });
}

/**
 * Full browser-local pipeline: decode the input Blob and re-encode it as a
 * balanced-quality JPEG. Rejects with ImageDecodeError / ImageEncodeError so
 * the UI can show a useful, specific message.
 */
export async function optimizeJpeg(
  input: Blob,
  quality: number = BALANCED_JPEG_QUALITY,
): Promise<OptimizeResult> {
  const { image, width, height } = await decodeImage(input);
  const blob = await encodeJpeg(image, width, height, quality);
  return { blob, dimensions: { width, height } };
}
