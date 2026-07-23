/**
 * Crop-rectangle geometry, in source-image pixel space.
 *
 * Pure and unit-tested; the component maps pointer movement (display pixels)
 * into source pixels via the display scale and calls these. Keeping the math
 * here means the interactive overlay stays thin.
 */

export interface Size {
  width: number;
  height: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Corner drag handles. */
export type Handle = 'nw' | 'ne' | 'sw' | 'se';

export const HANDLES: Handle[] = ['nw', 'ne', 'sw', 'se'];

/** Smallest allowed crop, in source pixels. */
export const MIN_CROP = 16;

/** Constrain a rect to sit within [0,0 .. bounds], honoring the minimum size. */
export function clampRect(rect: Rect, bounds: Size): Rect {
  const width = Math.min(Math.max(rect.width, MIN_CROP), bounds.width);
  const height = Math.min(Math.max(rect.height, MIN_CROP), bounds.height);
  const x = Math.min(Math.max(rect.x, 0), bounds.width - width);
  const y = Math.min(Math.max(rect.y, 0), bounds.height - height);
  return { x, y, width, height };
}

/** A sensible starting crop: centered, ~80% of the image. */
export function defaultCrop(bounds: Size): Rect {
  const width = Math.round(bounds.width * 0.8);
  const height = Math.round(bounds.height * 0.8);
  return clampRect(
    {
      x: Math.round((bounds.width - width) / 2),
      y: Math.round((bounds.height - height) / 2),
      width,
      height,
    },
    bounds,
  );
}

/** Translate a rect by (dx, dy), keeping it within bounds. */
export function moveRect(rect: Rect, dx: number, dy: number, bounds: Size): Rect {
  return clampRect({ ...rect, x: rect.x + dx, y: rect.y + dy }, bounds);
}

/**
 * Resize by dragging a corner handle by (dx, dy). The opposite corner stays
 * fixed; dragging past it normalizes (no inversion), the minimum size is
 * enforced, and the result is clamped to bounds.
 */
export function resizeRect(rect: Rect, handle: Handle, dx: number, dy: number, bounds: Size): Rect {
  const left = rect.x;
  const top = rect.y;
  const right = rect.x + rect.width;
  const bottom = rect.y + rect.height;

  let l = left;
  let t = top;
  let r = right;
  let b = bottom;

  if (handle === 'nw') {
    l = left + dx;
    t = top + dy;
  } else if (handle === 'ne') {
    r = right + dx;
    t = top + dy;
  } else if (handle === 'sw') {
    l = left + dx;
    b = bottom + dy;
  } else {
    r = right + dx;
    b = bottom + dy;
  }

  return clampRect(
    { x: Math.min(l, r), y: Math.min(t, b), width: Math.abs(r - l), height: Math.abs(b - t) },
    bounds,
  );
}

/** Integer output dimensions for a crop rect. */
export function outputSize(rect: Rect): Size {
  return { width: Math.round(rect.width), height: Math.round(rect.height) };
}
