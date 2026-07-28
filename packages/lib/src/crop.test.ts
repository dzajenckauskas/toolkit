import { describe, expect, it } from 'vitest';
import {
  ASPECT_RATIOS,
  applyAspectRatio,
  clampRect,
  defaultCrop,
  moveRect,
  outputSize,
  resizeRect,
  scaleToLongEdge,
  type Size,
} from './crop';

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

describe('applyAspectRatio', () => {
  it('makes a square for 1:1, centered on the original', () => {
    const r = applyAspectRatio({ x: 100, y: 100, width: 400, height: 200 }, 1, bounds);
    expect(r.width).toBe(r.height);
    // centered on original center (300, 200)
    expect(r.x + r.width / 2).toBeCloseTo(300);
    expect(r.y + r.height / 2).toBeCloseTo(200);
  });

  it('derives height from width for a wide ratio and stays in bounds', () => {
    const r = applyAspectRatio({ x: 0, y: 0, width: 800, height: 800 }, 16 / 9, bounds);
    expect(r.width / r.height).toBeCloseTo(16 / 9, 3);
    expect(r.x).toBeGreaterThanOrEqual(0);
    expect(r.x + r.width).toBeLessThanOrEqual(bounds.width);
    expect(r.y + r.height).toBeLessThanOrEqual(bounds.height);
  });

  it('shrinks to fit when the derived height exceeds bounds (tall ratio)', () => {
    const r = applyAspectRatio({ x: 0, y: 0, width: 900, height: 780 }, 0.5, bounds);
    expect(r.height).toBeLessThanOrEqual(bounds.height);
    expect(r.width / r.height).toBeCloseTo(0.5, 2);
  });

  it('exposes the expected presets', () => {
    expect(ASPECT_RATIOS['1:1']).toBe(1);
    expect(ASPECT_RATIOS['4:5']).toBeCloseTo(0.8);
    expect(ASPECT_RATIOS.free).toBeNull();
  });
});

describe('scaleToLongEdge', () => {
  it('returns the rounded native size when longEdge is null', () => {
    expect(scaleToLongEdge({ width: 249.6, height: 189.2 }, null)).toEqual({
      width: 250,
      height: 189,
    });
  });

  it('scales a landscape size so the long edge matches', () => {
    expect(scaleToLongEdge({ width: 1000, height: 500 }, 2048)).toEqual({
      width: 2048,
      height: 1024,
    });
  });

  it('scales a portrait size by its height (the long edge)', () => {
    expect(scaleToLongEdge({ width: 500, height: 1000 }, 512)).toEqual({
      width: 256,
      height: 512,
    });
  });

  it('keeps a square square', () => {
    expect(scaleToLongEdge({ width: 800, height: 800 }, 1024)).toEqual({
      width: 1024,
      height: 1024,
    });
  });
});

describe('resizeRect with a ratio', () => {
  it('keeps the aspect ratio while resizing from the SE handle', () => {
    const r = resizeRect({ x: 100, y: 100, width: 300, height: 300 }, 'se', 60, 0, bounds, 1);
    expect(r.width).toBeCloseTo(r.height);
    // anchored at the top-left
    expect(r).toMatchObject({ x: 100, y: 100 });
  });

  it('anchors the bottom-right when resizing from the NW handle', () => {
    const start = { x: 100, y: 100, width: 300, height: 300 };
    const r = resizeRect(start, 'nw', -60, 0, bounds, 1);
    expect(r.width).toBeCloseTo(r.height);
    // bottom-right corner stays at (400, 400)
    expect(r.x + r.width).toBeCloseTo(400);
    expect(r.y + r.height).toBeCloseTo(400);
  });
});
