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
 *
 * When `ratio` (width / height) is given, the box keeps that aspect ratio:
 * the width follows the drag and the height is derived, anchored at the fixed
 * corner.
 */
export function resizeRect(
  rect: Rect,
  handle: Handle,
  dx: number,
  dy: number,
  bounds: Size,
  ratio: number | null = null,
): Rect {
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

  let x = Math.min(l, r);
  let y = Math.min(t, b);
  const width = Math.abs(r - l);
  let height = Math.abs(b - t);

  if (ratio) {
    height = width / ratio;
    const fixedRight = handle === 'nw' || handle === 'sw';
    const fixedBottom = handle === 'nw' || handle === 'ne';
    const anchorX = fixedRight ? right : left;
    const anchorY = fixedBottom ? bottom : top;
    x = fixedRight ? anchorX - width : anchorX;
    y = fixedBottom ? anchorY - height : anchorY;
  }

  return clampRect({ x, y, width, height }, bounds);
}

/** Integer output dimensions for a crop rect. */
export function outputSize(rect: Rect): Size {
  return { width: Math.round(rect.width), height: Math.round(rect.height) };
}

/** Aspect-ratio presets (value = width / height; `null` = free). */
export const ASPECT_RATIOS = {
  free: null,
  '1:1': 1,
  '4:5': 4 / 5,
  '4:3': 4 / 3,
  '16:9': 16 / 9,
} as const;

export type AspectKey = keyof typeof ASPECT_RATIOS;

export const ASPECT_KEYS = Object.keys(ASPECT_RATIOS) as AspectKey[];

/** Export-size presets — the output's longest edge in pixels (`null` = native). */
export const EXPORT_SIZES = {
  original: null,
  '2048': 2048,
  '1600': 1600,
  '1024': 1024,
  '512': 512,
} as const;

export type ExportSizeKey = keyof typeof EXPORT_SIZES;

export const EXPORT_SIZE_KEYS = Object.keys(EXPORT_SIZES) as ExportSizeKey[];

/**
 * Marketplace export presets. Each locks both an aspect ratio and an exact
 * output pixel size, distinct from the free aspect-ratio + longest-edge
 * options above. Sizes follow each marketplace's recommended primary product
 * image; tweak here in one place if a marketplace changes its guidance.
 */
export interface MarketplacePreset {
  label: string;
  width: number;
  height: number;
}

export const MARKETPLACE_PRESETS = {
  'amazon-2000': { label: 'Amazon 2000×2000', width: 2000, height: 2000 },
  'etsy-2700x2025': { label: 'Etsy 2700×2025', width: 2700, height: 2025 },
  'ebay-1600': { label: 'eBay 1600×1600', width: 1600, height: 1600 },
  'shopify-2048': { label: 'Shopify 2048×2048', width: 2048, height: 2048 },
  'instagram-1080': { label: 'Instagram 1080×1080', width: 1080, height: 1080 },
  'instagram-1080x1350': { label: 'Instagram portrait 1080×1350', width: 1080, height: 1350 },
} as const satisfies Record<string, MarketplacePreset>;

export type MarketplaceKey = keyof typeof MARKETPLACE_PRESETS;

export const MARKETPLACE_KEYS = Object.keys(MARKETPLACE_PRESETS) as MarketplaceKey[];

/** The aspect ratio (width / height) a marketplace preset locks the crop to. */
export function presetRatio(key: MarketplaceKey): number {
  const preset = MARKETPLACE_PRESETS[key];
  return preset.width / preset.height;
}

/**
 * The final output size. A marketplace preset forces its exact pixel size
 * (the crop is already locked to the matching ratio); otherwise the crop is
 * scaled so its longest edge equals `longEdge` (`null` = native).
 */
export function resolveOutputSize(
  crop: Rect,
  preset: MarketplaceKey | null,
  longEdge: number | null,
): Size {
  if (preset) {
    const { width, height } = MARKETPLACE_PRESETS[preset];
    return { width, height };
  }
  return scaleToLongEdge(outputSize(crop), longEdge);
}

/**
 * Scale a size so its longest edge equals `longEdge`, preserving aspect ratio.
 * `null` returns the size rounded to whole pixels (native output).
 */
export function scaleToLongEdge(size: Size, longEdge: number | null): Size {
  if (!longEdge) {
    return { width: Math.round(size.width), height: Math.round(size.height) };
  }
  const max = Math.max(size.width, size.height);
  if (max === 0) return { width: 0, height: 0 };
  const factor = longEdge / max;
  return { width: Math.round(size.width * factor), height: Math.round(size.height * factor) };
}

/**
 * Re-fit a rect to the given aspect ratio (width / height), centered on the
 * current rect and clamped to bounds. Used when a preset is selected.
 */
export function applyAspectRatio(rect: Rect, ratio: number, bounds: Size): Rect {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;

  let width = rect.width;
  let height = width / ratio;
  if (height > bounds.height) {
    height = bounds.height;
    width = height * ratio;
  }
  if (width > bounds.width) {
    width = bounds.width;
    height = width / ratio;
  }

  return clampRect({ x: cx - width / 2, y: cy - height / 2, width, height }, bounds);
}
