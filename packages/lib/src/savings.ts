/**
 * Size comparison between an original and an optimized image.
 *
 * Honesty rule (docs/ux/design-principles.md): never imply quality is
 * unchanged, and report the real result. Canvas re-encoding occasionally
 * produces a *larger* file for an already-optimized JPEG, so savings can
 * legitimately be zero or negative and callers must be able to show that.
 */

export interface SizeComparison {
  originalBytes: number;
  optimizedBytes: number;
  /** Positive when smaller, negative when the output grew. */
  savedBytes: number;
  /** Percentage saved, rounded to one decimal. Negative when the output grew. */
  savedPercent: number;
  /** True only when the optimized file is actually smaller. */
  isSmaller: boolean;
}

export function calculateSavings(originalBytes: number, optimizedBytes: number): SizeComparison {
  const safeOriginal = Math.max(0, originalBytes);
  const safeOptimized = Math.max(0, optimizedBytes);
  const savedBytes = safeOriginal - safeOptimized;

  const rawPercent = safeOriginal === 0 ? 0 : (savedBytes / safeOriginal) * 100;
  const savedPercent = Math.round(rawPercent * 10) / 10;

  return {
    originalBytes: safeOriginal,
    optimizedBytes: safeOptimized,
    savedBytes,
    savedPercent,
    isSmaller: savedBytes > 0,
  };
}
