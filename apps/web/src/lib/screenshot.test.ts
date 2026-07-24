import { describe, expect, it } from 'vitest';
import { BACKGROUNDS, framedSize } from './screenshot';

describe('screenshot', () => {
  it('adds padding to both sides of the image', () => {
    expect(framedSize(800, 600, 40)).toEqual({ width: 880, height: 680 });
    expect(framedSize(800, 600, 0)).toEqual({ width: 800, height: 600 });
  });

  it('clamps negative padding to zero', () => {
    expect(framedSize(100, 100, -20)).toEqual({ width: 100, height: 100 });
  });

  it('offers named backgrounds with CSS', () => {
    expect(BACKGROUNDS.length).toBeGreaterThan(0);
    expect(BACKGROUNDS.every((b) => typeof b.css === 'string' && b.css.length > 0)).toBe(true);
  });
});
