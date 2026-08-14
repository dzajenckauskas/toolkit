/**
 * Browser-local image decoding via the Canvas API, plus the shared decode/
 * encode error types. Re-encoding (compress, resize, crop, rotate, convert)
 * lives in `image.ts`, which builds on `decodeImage` here. No network, no
 * dependencies, no server.
 *
 * This module is browser-only (it touches document/Image/canvas) and is
 * exercised by the Playwright suite rather than the jsdom unit tests.
 */

export interface DecodedDimensions {
  width: number;
  height: number;
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
