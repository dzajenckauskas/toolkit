import { describe, expect, it } from 'vitest';
import { nearestColorName } from './color-names';

describe('color-names', () => {
  it('finds an exact match', () => {
    const result = nearestColorName('#ff0000');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('red');
    expect(result!.exact).toBe(true);
    expect(result!.distance).toBe(0);
  });

  it('finds the nearest approximate match', () => {
    const result = nearestColorName('#fe0201'); // almost red
    expect(result!.name).toBe('red');
    expect(result!.exact).toBe(false);
    expect(result!.distance).toBeGreaterThan(0);
  });

  it('matches shorthand hex', () => {
    expect(nearestColorName('#000')!.name).toBe('black');
  });

  it('returns null for invalid input', () => {
    expect(nearestColorName('nope')).toBeNull();
  });
});
