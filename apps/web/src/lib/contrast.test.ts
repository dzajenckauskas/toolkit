import { describe, expect, it } from 'vitest';
import { contrastRatio, hexContrast, relativeLuminance } from './contrast';

describe('contrast', () => {
  it('computes luminance extremes', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5);
  });

  it('black on white is 21:1', () => {
    expect(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(21, 1);
  });

  it('same colour is 1:1', () => {
    expect(contrastRatio({ r: 100, g: 100, b: 100 }, { r: 100, g: 100, b: 100 })).toBeCloseTo(1, 5);
  });

  it('evaluates WCAG thresholds from hex', () => {
    const result = hexContrast('#000000', '#ffffff');
    expect(result).not.toBeNull();
    expect(result!.aaNormal).toBe(true);
    expect(result!.aaaNormal).toBe(true);

    const low = hexContrast('#777777', '#888888');
    expect(low!.aaNormal).toBe(false);
  });

  it('returns null for invalid hex', () => {
    expect(hexContrast('nope', '#fff')).toBeNull();
  });
});
