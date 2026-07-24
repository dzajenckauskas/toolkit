import { describe, expect, it } from 'vitest';
import { percentChange, percentOf, tip, whatPercent } from './percentage';

describe('percentage', () => {
  it('computes percent of a total', () => {
    expect(percentOf(15, 200)).toBe(30);
  });

  it('computes what percent one number is of another', () => {
    expect(whatPercent(30, 200)).toBe(15);
    expect(whatPercent(1, 0)).toBe(0);
  });

  it('computes percent change', () => {
    expect(percentChange(100, 150)).toBe(50);
    expect(percentChange(100, 75)).toBe(-25);
    expect(percentChange(0, 5)).toBe(0);
  });

  it('tips and splits a bill', () => {
    expect(tip(100, 20, 4)).toEqual({ tip: 20, total: 120, perPerson: 30 });
    expect(tip(50, 10).perPerson).toBeCloseTo(55);
    expect(tip(50, 10, 0).perPerson).toBeCloseTo(55); // people clamps to 1
  });
});
