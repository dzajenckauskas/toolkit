/**
 * Extract a dominant-colour palette from raw RGBA pixels by quantising into
 * 12-bit colour buckets and ranking by frequency. Pure and unit-testable; the
 * component supplies pixels from a downscaled canvas.
 */

import { rgbToHex } from './color';

interface Bucket {
  count: number;
  r: number;
  g: number;
  b: number;
}

/** Return up to `count` dominant colours (hex) from RGBA pixel data. */
export function extractPalette(rgba: Uint8ClampedArray | number[], count = 6): string[] {
  const buckets = new Map<number, Bucket>();
  for (let i = 0; i + 3 < rgba.length; i += 4) {
    const alpha = rgba[i + 3]!;
    if (alpha < 125) continue; // skip mostly-transparent pixels
    const r = rgba[i]!;
    const g = rgba[i + 1]!;
    const b = rgba[i + 2]!;
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.count++;
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
    } else {
      buckets.set(key, { count: 1, r, g, b });
    }
  }

  return [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, Math.max(1, count))
    .map((bucket) =>
      rgbToHex({
        r: bucket.r / bucket.count,
        g: bucket.g / bucket.count,
        b: bucket.b / bucket.count,
      }),
    );
}
