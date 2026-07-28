import { describe, expect, it } from 'vitest';
import { hslToRgb, parseHex, rgbToHex, rgbToHsl } from './color';

describe('color', () => {
  it('parses #RRGGBB and #RGB', () => {
    expect(parseHex('#ff8800')).toEqual({ r: 255, g: 136, b: 0 });
    expect(parseHex('#f80')).toEqual({ r: 255, g: 136, b: 0 });
    expect(parseHex('336699')).toEqual({ r: 51, g: 102, b: 153 });
  });

  it('returns null for malformed hex', () => {
    expect(parseHex('#12')).toBeNull();
    expect(parseHex('nothex')).toBeNull();
  });

  it('formats RGB back to hex', () => {
    expect(rgbToHex({ r: 255, g: 136, b: 0 })).toBe('#ff8800');
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
  });

  it('converts primary colors to HSL', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 });
    expect(rgbToHsl({ r: 0, g: 255, b: 0 })).toEqual({ h: 120, s: 100, l: 50 });
    expect(rgbToHsl({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, l: 100 });
  });

  it('round-trips RGB → HSL → RGB', () => {
    const rgb = { r: 51, g: 102, b: 153 };
    const back = hslToRgb(rgbToHsl(rgb));
    expect(back.r).toBeCloseTo(rgb.r, -1);
    expect(back.g).toBeCloseTo(rgb.g, -1);
    expect(back.b).toBeCloseTo(rgb.b, -1);
  });
});
