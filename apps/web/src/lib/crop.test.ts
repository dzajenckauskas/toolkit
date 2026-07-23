import { describe, expect, it } from 'vitest';
import { clampRect, defaultCrop, moveRect, outputSize, resizeRect, type Size } from './crop';

const bounds: Size = { width: 1000, height: 800 };

describe('clampRect', () => {
  it('leaves an in-bounds rect unchanged', () => {
    const r = { x: 100, y: 100, width: 200, height: 150 };
    expect(clampRect(r, bounds)).toEqual(r);
  });

  it('pulls a rect back inside the right/bottom edges', () => {
    const r = clampRect({ x: 950, y: 780, width: 200, height: 150 }, bounds);
    expect(r.x + r.width).toBeLessThanOrEqual(bounds.width);
    expect(r.y + r.height).toBeLessThanOrEqual(bounds.height);
  });

  it('clamps negative origin to zero', () => {
    expect(clampRect({ x: -50, y: -30, width: 100, height: 100 }, bounds)).toMatchObject({
      x: 0,
      y: 0,
    });
  });

  it('enforces the minimum size and caps at the bounds', () => {
    expect(clampRect({ x: 0, y: 0, width: 1, height: 1 }, bounds)).toMatchObject({
      width: 16,
      height: 16,
    });
    expect(clampRect({ x: 0, y: 0, width: 9999, height: 9999 }, bounds)).toMatchObject({
      width: 1000,
      height: 800,
    });
  });
});

describe('defaultCrop', () => {
  it('is centered at ~80% and within bounds', () => {
    const r = defaultCrop(bounds);
    expect(r.width).toBe(800);
    expect(r.height).toBe(640);
    expect(r.x).toBe(100);
    expect(r.y).toBe(80);
  });
});

describe('moveRect', () => {
  it('translates within bounds', () => {
    expect(moveRect({ x: 100, y: 100, width: 200, height: 150 }, 50, -30, bounds)).toMatchObject({
      x: 150,
      y: 70,
    });
  });

  it('stops at the edge instead of leaving the image', () => {
    const r = moveRect({ x: 900, y: 700, width: 200, height: 150 }, 500, 500, bounds);
    expect(r.x).toBe(800); // 1000 - 200
    expect(r.y).toBe(650); // 800 - 150
  });
});

describe('resizeRect', () => {
  it('grows from the SE handle keeping the top-left fixed', () => {
    const r = resizeRect({ x: 100, y: 100, width: 200, height: 150 }, 'se', 50, 40, bounds);
    expect(r).toMatchObject({ x: 100, y: 100, width: 250, height: 190 });
  });

  it('moves the NW corner keeping the bottom-right fixed', () => {
    const r = resizeRect({ x: 100, y: 100, width: 200, height: 150 }, 'nw', 40, 30, bounds);
    // bottom-right stays at (300, 250)
    expect(r).toMatchObject({ x: 140, y: 130, width: 160, height: 120 });
  });

  it('normalizes when dragged past the opposite corner (no inversion)', () => {
    const r = resizeRect({ x: 100, y: 100, width: 200, height: 150 }, 'se', -400, -400, bounds);
    expect(r.width).toBeGreaterThanOrEqual(16);
    expect(r.height).toBeGreaterThanOrEqual(16);
  });
});

describe('outputSize', () => {
  it('rounds to integer pixels', () => {
    expect(outputSize({ x: 0, y: 0, width: 249.6, height: 189.2 })).toEqual({
      width: 250,
      height: 189,
    });
  });
});
