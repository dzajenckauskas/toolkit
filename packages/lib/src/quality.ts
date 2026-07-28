import { BALANCED_JPEG_QUALITY } from './constants';

/**
 * Compression presets for the optimizer.
 *
 * The UI exposes a small set of named levels rather than a raw 0..1 number:
 * it keeps the fast path simple (one balanced default) while letting users
 * trade quality for size when they need to. Each level maps to a JPEG quality
 * passed to canvas.toBlob (see optimize.ts / ADR-005).
 */
export type QualityLevel = 'low' | 'balanced' | 'high';

export const QUALITY_LEVELS: QualityLevel[] = ['low', 'balanced', 'high'];

/** The default level — unchanged from the Sprint 001 fast path. */
export const DEFAULT_QUALITY_LEVEL: QualityLevel = 'balanced';

interface QualityMeta {
  value: number;
  label: string;
  hint: string;
}

const QUALITY: Record<QualityLevel, QualityMeta> = {
  low: { value: 0.6, label: 'Smaller file', hint: 'Lower quality' },
  // "balanced" reuses the single Sprint 001 default so behavior is identical
  // when the user does not touch the control.
  balanced: { value: BALANCED_JPEG_QUALITY, label: 'Balanced', hint: 'Recommended' },
  high: { value: 0.92, label: 'Higher quality', hint: 'Larger file' },
};

/** Map a level to the numeric JPEG quality (0..1) for canvas.toBlob. */
export function qualityValue(level: QualityLevel): number {
  return QUALITY[level].value;
}

/** Short human label for the level (for the control). */
export function qualityLabel(level: QualityLevel): string {
  return QUALITY[level].label;
}

/** Secondary hint text for the level. */
export function qualityHint(level: QualityLevel): string {
  return QUALITY[level].hint;
}

/** Narrow an arbitrary string to a QualityLevel, falling back to the default. */
export function toQualityLevel(value: string | null | undefined): QualityLevel {
  return (QUALITY_LEVELS as string[]).includes(value ?? '')
    ? (value as QualityLevel)
    : DEFAULT_QUALITY_LEVEL;
}
