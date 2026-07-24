/**
 * Colour harmony, mixing, and tint/shade helpers built on the HEX/RGB/HSL
 * primitives in `color`. Pure; works anywhere.
 */

import { hslToRgb, parseHex, rgbToHex, rgbToHsl, type Hsl, type Rgb } from './color';

/** Linear mix of two colours; weight 0 = a, 1 = b. */
export function mixRgb(a: Rgb, b: Rgb, weight = 0.5): Rgb {
  const w = Math.max(0, Math.min(1, weight));
  return {
    r: Math.round(a.r + (b.r - a.r) * w),
    g: Math.round(a.g + (b.g - a.g) * w),
    b: Math.round(a.b + (b.b - a.b) * w),
  };
}

/** Mix two hex colours; returns hex, or null if either is invalid. */
export function mixHex(a: string, b: string, weight = 0.5): string | null {
  const ra = parseHex(a);
  const rb = parseHex(b);
  if (!ra || !rb) return null;
  return rgbToHex(mixRgb(ra, rb, weight));
}

/** `steps` evenly-spaced blends from a to b, inclusive of both ends. */
export function blendSteps(a: string, b: string, steps: number): string[] {
  const ra = parseHex(a);
  const rb = parseHex(b);
  const n = Math.max(2, Math.floor(steps));
  if (!ra || !rb) return [];
  return Array.from({ length: n }, (_, i) => rgbToHex(mixRgb(ra, rb, i / (n - 1))));
}

function rotate(hsl: Hsl, deg: number): Hsl {
  return { ...hsl, h: (((hsl.h + deg) % 360) + 360) % 360 };
}

function toHex(hsl: Hsl): string {
  return rgbToHex(hslToRgb(hsl));
}

export interface Harmonies {
  complementary: string[];
  analogous: string[];
  triadic: string[];
  tetradic: string[];
  monochromatic: string[];
}

/** Classic colour-wheel harmonies from a base hex. Returns [] fields on bad input. */
export function harmonies(baseHex: string): Harmonies | null {
  const rgb = parseHex(baseHex);
  if (!rgb) return null;
  const base = rgbToHsl(rgb);
  const withL = (l: number): Hsl => ({ ...base, l: Math.max(0, Math.min(100, l)) });
  return {
    complementary: [toHex(base), toHex(rotate(base, 180))],
    analogous: [toHex(rotate(base, -30)), toHex(base), toHex(rotate(base, 30))],
    triadic: [toHex(base), toHex(rotate(base, 120)), toHex(rotate(base, 240))],
    tetradic: [
      toHex(base),
      toHex(rotate(base, 90)),
      toHex(rotate(base, 180)),
      toHex(rotate(base, 270)),
    ],
    monochromatic: [
      withL(base.l - 30),
      withL(base.l - 15),
      base,
      withL(base.l + 15),
      withL(base.l + 30),
    ].map(toHex),
  };
}

/** `n` tints (towards white) of a base hex, from base to near-white. */
export function tints(baseHex: string, n = 5): string[] {
  const rgb = parseHex(baseHex);
  if (!rgb) return [];
  const white = { r: 255, g: 255, b: 255 };
  return Array.from({ length: n }, (_, i) => rgbToHex(mixRgb(rgb, white, (i / n) * 0.9)));
}

/** `n` shades (towards black) of a base hex. */
export function shades(baseHex: string, n = 5): string[] {
  const rgb = parseHex(baseHex);
  if (!rgb) return [];
  const black = { r: 0, g: 0, b: 0 };
  return Array.from({ length: n }, (_, i) => rgbToHex(mixRgb(rgb, black, (i / n) * 0.9)));
}
