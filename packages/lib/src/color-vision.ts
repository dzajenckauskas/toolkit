/**
 * Colour-blindness (CVD) simulation via standard 3×3 approximation matrices
 * applied to sRGB. Good enough to preview how a palette reads for different
 * vision types. Pure; reuses the hex helpers from `color`.
 */

import { parseHex, rgbToHex, type Rgb } from './color';

export type VisionType = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export const VISION_TYPES: VisionType[] = [
  'normal',
  'protanopia',
  'deuteranopia',
  'tritanopia',
  'achromatopsia',
];

export const VISION_LABELS: Record<VisionType, string> = {
  normal: 'Normal',
  protanopia: 'Protanopia (red-blind)',
  deuteranopia: 'Deuteranopia (green-blind)',
  tritanopia: 'Tritanopia (blue-blind)',
  achromatopsia: 'Achromatopsia (no color)',
};

type Matrix = [number, number, number, number, number, number, number, number, number];

const MATRICES: Record<Exclude<VisionType, 'normal' | 'achromatopsia'>, Matrix> = {
  protanopia: [0.567, 0.433, 0.0, 0.558, 0.442, 0.0, 0.0, 0.242, 0.758],
  deuteranopia: [0.625, 0.375, 0.0, 0.7, 0.3, 0.0, 0.0, 0.3, 0.7],
  tritanopia: [0.95, 0.05, 0.0, 0.0, 0.433, 0.567, 0.0, 0.475, 0.525],
};

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

/** Simulate how `rgb` appears under the given vision type. */
export function simulateRgb(rgb: Rgb, type: VisionType): Rgb {
  if (type === 'normal') return { ...rgb };
  if (type === 'achromatopsia') {
    const y = clamp(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
    return { r: y, g: y, b: y };
  }
  const m = MATRICES[type];
  return {
    r: clamp(m[0] * rgb.r + m[1] * rgb.g + m[2] * rgb.b),
    g: clamp(m[3] * rgb.r + m[4] * rgb.g + m[5] * rgb.b),
    b: clamp(m[6] * rgb.r + m[7] * rgb.g + m[8] * rgb.b),
  };
}

/** Simulate a hex colour; returns hex, or null if the input is invalid. */
export function simulateHex(hex: string, type: VisionType): string | null {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  return rgbToHex(simulateRgb(rgb, type));
}
