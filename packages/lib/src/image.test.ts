import { describe, expect, it } from 'vitest';
import {
  clampSize,
  DEFAULT_IMAGE_BACKGROUND,
  extensionFor,
  fitWithin,
  formatHasAlpha,
  IDENTITY_TRANSFORM,
  imageFormatForInput,
  isLossy,
  lockAspect,
  mimeFor,
  outputImageName,
  rotateCCW,
  rotateCW,
  rotateSize,
  validateImageFile,
} from './image';

describe('image helpers', () => {
  it('validates image files by type and size', () => {
    expect(validateImageFile({ name: 'a.png', type: 'image/png', size: 100 }).ok).toBe(true);
    expect(validateImageFile({ name: 'a.webp', type: '', size: 100 }).ok).toBe(true); // ext fallback
    expect(validateImageFile({ name: 'a.txt', type: 'text/plain', size: 100 }).ok).toBe(false);
    expect(validateImageFile({ name: 'a.png', type: 'image/png', size: 0 }).ok).toBe(false);
    expect(validateImageFile({ name: 'a.png', type: 'image/png', size: 26 * 1024 * 1024 }).ok).toBe(
      false,
    );
  });

  it('maps formats to mime types and extensions', () => {
    expect(mimeFor('jpeg')).toBe('image/jpeg');
    expect(extensionFor('jpeg')).toBe('jpg');
    expect(extensionFor('png')).toBe('png');
    expect(isLossy('png')).toBe(false);
    expect(isLossy('webp')).toBe(true);
  });

  it('preserves the input format where the canvas can re-encode it', () => {
    expect(imageFormatForInput('image/jpeg', 'a.jpg')).toBe('jpeg');
    expect(imageFormatForInput('image/png', 'a.png')).toBe('png');
    expect(imageFormatForInput('image/webp', 'a.webp')).toBe('webp');
    // GIF/BMP decode but can't be canvas-encoded → lossless PNG fallback.
    expect(imageFormatForInput('image/gif', 'a.gif')).toBe('png');
    expect(imageFormatForInput('image/bmp', 'a.bmp')).toBe('png');
    // Empty MIME (drag-and-drop) falls back to the extension.
    expect(imageFormatForInput('', 'photo.JPEG')).toBe('jpeg');
    expect(imageFormatForInput('', 'photo.webp')).toBe('webp');
    expect(imageFormatForInput('', 'photo.png')).toBe('png');
  });

  it('reports alpha support per format so transparent sources fill instead of blacking out', () => {
    // JPEG has no alpha channel: without a background fill the encoder paints
    // transparent pixels black. PNG and WebP keep transparency.
    expect(formatHasAlpha('jpeg')).toBe(false);
    expect(formatHasAlpha('png')).toBe(true);
    expect(formatHasAlpha('webp')).toBe(true);
    expect(DEFAULT_IMAGE_BACKGROUND).toBe('#ffffff');
  });

  it('builds output filenames with a new extension', () => {
    expect(outputImageName('photo.png', 'resized', 'jpg')).toBe('photo-resized.jpg');
    expect(outputImageName('a.b.webp', 'converted', 'png')).toBe('a.b-converted.png');
    expect(outputImageName('noext', 'rotated', 'png')).toBe('noext-rotated.png');
    expect(outputImageName('  ', 'x', 'png')).toBe('image-x.png');
  });

  it('clamps to at least 1x1 integer pixels', () => {
    expect(clampSize({ width: 0, height: 0 })).toEqual({ width: 1, height: 1 });
    expect(clampSize({ width: 10.6, height: 4.2 })).toEqual({ width: 11, height: 4 });
  });

  it('locks aspect ratio from either dimension', () => {
    const original = { width: 800, height: 400 }; // 2:1
    expect(lockAspect(original, { width: 400 })).toEqual({ width: 400, height: 200 });
    expect(lockAspect(original, { height: 100 })).toEqual({ width: 200, height: 100 });
  });

  it('fits within bounds without upscaling', () => {
    expect(fitWithin({ width: 2000, height: 1000 }, 1000, 1000)).toEqual({
      width: 1000,
      height: 500,
    });
    expect(fitWithin({ width: 500, height: 500 }, 1000, 1000)).toEqual({
      width: 500,
      height: 500,
    });
  });

  it('swaps dimensions on odd quarter turns', () => {
    expect(rotateSize({ width: 800, height: 600 }, 1)).toEqual({ width: 600, height: 800 });
    expect(rotateSize({ width: 800, height: 600 }, 2)).toEqual({ width: 800, height: 600 });
    expect(rotateSize({ width: 800, height: 600 }, 3)).toEqual({ width: 600, height: 800 });
  });

  it('rotates transforms in both directions with wraparound', () => {
    expect(rotateCW(IDENTITY_TRANSFORM).quarterTurns).toBe(1);
    expect(rotateCCW(IDENTITY_TRANSFORM).quarterTurns).toBe(3);
    expect(rotateCW({ ...IDENTITY_TRANSFORM, quarterTurns: 3 }).quarterTurns).toBe(0);
  });
});
