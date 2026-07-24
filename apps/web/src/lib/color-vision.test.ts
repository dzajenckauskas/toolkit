import { describe, expect, it } from 'vitest';
import { simulateHex, simulateRgb } from './color-vision';

describe('color-vision', () => {
  it('leaves colours unchanged under normal vision', () => {
    expect(simulateRgb({ r: 12, g: 200, b: 99 }, 'normal')).toEqual({ r: 12, g: 200, b: 99 });
  });

  it('greys out under achromatopsia', () => {
    const out = simulateRgb({ r: 255, g: 0, b: 0 }, 'achromatopsia');
    expect(out.r).toBe(out.g);
    expect(out.g).toBe(out.b);
    expect(out.r).toBe(76); // 0.299 * 255
  });

  it('shifts red under protanopia', () => {
    const out = simulateHex('#ff0000', 'protanopia');
    expect(out).not.toBe('#ff0000');
    expect(out).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('returns null for invalid hex', () => {
    expect(simulateHex('nope', 'deuteranopia')).toBeNull();
  });
});
