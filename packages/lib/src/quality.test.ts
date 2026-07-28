import { describe, expect, it } from 'vitest';
import {
  DEFAULT_QUALITY_LEVEL,
  QUALITY_LEVELS,
  qualityValue,
  toQualityLevel,
  type QualityLevel,
} from './quality';
import { BALANCED_JPEG_QUALITY } from './constants';

describe('quality levels', () => {
  it('exposes exactly low, balanced, high', () => {
    expect(QUALITY_LEVELS).toEqual(['low', 'balanced', 'high']);
  });

  it('defaults to balanced', () => {
    expect(DEFAULT_QUALITY_LEVEL).toBe('balanced');
  });

  it('keeps balanced identical to the Sprint 001 default', () => {
    expect(qualityValue('balanced')).toBe(BALANCED_JPEG_QUALITY);
  });

  it('orders values low < balanced < high, all within 0..1', () => {
    const low = qualityValue('low');
    const balanced = qualityValue('balanced');
    const high = qualityValue('high');
    expect(low).toBeLessThan(balanced);
    expect(balanced).toBeLessThan(high);
    for (const v of [low, balanced, high]) {
      expect(v).toBeGreaterThan(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('maps every level to a defined numeric value', () => {
    for (const level of QUALITY_LEVELS) {
      expect(typeof qualityValue(level as QualityLevel)).toBe('number');
    }
  });

  it('narrows valid strings and falls back to the default otherwise', () => {
    expect(toQualityLevel('high')).toBe('high');
    expect(toQualityLevel('low')).toBe('low');
    expect(toQualityLevel('nonsense')).toBe(DEFAULT_QUALITY_LEVEL);
    expect(toQualityLevel(null)).toBe(DEFAULT_QUALITY_LEVEL);
    expect(toQualityLevel(undefined)).toBe(DEFAULT_QUALITY_LEVEL);
  });
});
