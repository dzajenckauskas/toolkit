/**
 * WCAG colour-contrast calculations. Pure; reuses the hex parser from `color`.
 */

import { parseHex, type Rgb } from './color';

function channel(value: number): number {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance per WCAG 2.x (0 = black, 1 = white). */
export function relativeLuminance({ r, g, b }: Rgb): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Contrast ratio between two colours (1–21). */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [light, dark] = la >= lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}

export interface WcagResult {
  ratio: number;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
}

/** Evaluate a ratio against the WCAG AA/AAA thresholds. */
export function wcagResult(ratio: number): WcagResult {
  return {
    ratio,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };
}

/** Convenience: contrast between two hex colours, or null if either is invalid. */
export function hexContrast(fg: string, bg: string): WcagResult | null {
  const a = parseHex(fg);
  const b = parseHex(bg);
  if (!a || !b) return null;
  return wcagResult(contrastRatio(a, b));
}
