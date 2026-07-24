import { describe, expect, it } from 'vitest';
import { blendSteps, harmonies, mixHex, mixRgb, shades, tints } from './color-harmony';

describe('color-harmony', () => {
  it('mixes two colours', () => {
    expect(mixRgb({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }, 0.5)).toEqual({
      r: 128,
      g: 128,
      b: 128,
    });
    expect(mixHex('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(mixHex('nope', '#fff')).toBeNull();
  });

  it('produces inclusive blend steps', () => {
    const steps = blendSteps('#000000', '#ffffff', 3);
    expect(steps).toHaveLength(3);
    expect(steps[0]).toBe('#000000');
    expect(steps[2]).toBe('#ffffff');
  });

  it('computes harmonies with the expected counts', () => {
    const h = harmonies('#ff0000');
    expect(h).not.toBeNull();
    expect(h!.complementary).toHaveLength(2);
    expect(h!.triadic).toHaveLength(3);
    expect(h!.tetradic).toHaveLength(4);
    expect(h!.analogous).toHaveLength(3);
    // complement of pure red is cyan-ish
    expect(h!.complementary[1]).toBe('#00ffff');
  });

  it('returns null harmonies for invalid input', () => {
    expect(harmonies('nope')).toBeNull();
  });

  it('generates tints and shades', () => {
    expect(tints('#ff0000', 5)).toHaveLength(5);
    expect(shades('#ff0000', 5)).toHaveLength(5);
    expect(tints('#ff0000')[0]).toBe('#ff0000'); // starts at base
  });
});
