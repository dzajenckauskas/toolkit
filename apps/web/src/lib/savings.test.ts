import { describe, expect, it } from 'vitest';
import { calculateSavings } from './savings';

describe('calculateSavings', () => {
  it('reports a positive reduction when the output is smaller', () => {
    const result = calculateSavings(1000, 400);
    expect(result.savedBytes).toBe(600);
    expect(result.savedPercent).toBe(60);
    expect(result.isSmaller).toBe(true);
  });

  it('rounds the percentage to one decimal place', () => {
    const result = calculateSavings(3000, 1000);
    expect(result.savedPercent).toBe(66.7);
  });

  it('reports a negative percentage when the output grew', () => {
    const result = calculateSavings(500, 800);
    expect(result.savedBytes).toBe(-300);
    expect(result.savedPercent).toBe(-60);
    expect(result.isSmaller).toBe(false);
  });

  it('treats an identical size as no reduction', () => {
    const result = calculateSavings(1000, 1000);
    expect(result.savedPercent).toBe(0);
    expect(result.isSmaller).toBe(false);
  });

  it('guards against a zero original size', () => {
    const result = calculateSavings(0, 0);
    expect(result.savedPercent).toBe(0);
    expect(result.isSmaller).toBe(false);
  });

  it('clamps negative inputs to zero before comparing', () => {
    const result = calculateSavings(-100, -50);
    expect(result.originalBytes).toBe(0);
    expect(result.optimizedBytes).toBe(0);
    expect(result.savedPercent).toBe(0);
  });
});
