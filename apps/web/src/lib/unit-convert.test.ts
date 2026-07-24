import { describe, expect, it } from 'vitest';
import { CATEGORIES, convertLinear, convertTemperature } from './unit-convert';

const unit = (categoryId: string, unitId: string) =>
  CATEGORIES.find((c) => c.id === categoryId)!.units.find((u) => u.id === unitId)!;

describe('unit-convert', () => {
  it('converts length', () => {
    const km = unit('length', 'km');
    const m = unit('length', 'm');
    expect(convertLinear(1, km.factor, m.factor)).toBe(1000);
    const mi = unit('length', 'mi');
    expect(convertLinear(1, mi.factor, km.factor)).toBeCloseTo(1.609344, 5);
  });

  it('converts weight', () => {
    const lb = unit('mass', 'lb');
    const g = unit('mass', 'g');
    expect(convertLinear(1, lb.factor, g.factor)).toBeCloseTo(453.59237, 3);
  });

  it('converts data sizes (1024-based)', () => {
    const gb = unit('data', 'GB');
    const mb = unit('data', 'MB');
    expect(convertLinear(1, gb.factor, mb.factor)).toBe(1024);
  });

  it('converts temperature', () => {
    expect(convertTemperature(100, 'C', 'F')).toBe(212);
    expect(convertTemperature(32, 'F', 'C')).toBe(0);
    expect(convertTemperature(0, 'C', 'K')).toBeCloseTo(273.15, 2);
    expect(convertTemperature(300, 'K', 'C')).toBeCloseTo(26.85, 2);
  });
});
