/**
 * Human-readable file sizes. UX rule: "Use human-readable file sizes."
 * (docs/ux/design-principles.md)
 */

const UNITS = ['B', 'KB', 'MB', 'GB'] as const;

/**
 * Format a byte count as a short human-readable string, e.g. 2_400_000 -> "2.4 MB".
 * Uses base-1024 units. Negative input is treated as 0.
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }

  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  const unit = UNITS[exponent] ?? 'B';

  // Whole bytes read oddly with decimals; everything larger keeps one decimal.
  const rendered = exponent === 0 ? String(Math.round(value)) : value.toFixed(1);
  return `${rendered} ${unit}`;
}
