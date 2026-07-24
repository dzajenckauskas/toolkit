import { describe, expect, it } from 'vitest';
import { extractPalette } from './image-palette';

// Build an RGBA array from [r,g,b] triples, all opaque.
const rgba = (pixels: [number, number, number][]): number[] =>
  pixels.flatMap(([r, g, b]) => [r, g, b, 255]);

describe('image-palette', () => {
  it('returns the single colour of a solid image', () => {
    expect(extractPalette(rgba([[255, 0, 0]]), 6)).toEqual(['#ff0000']);
  });

  it('ranks colours by frequency', () => {
    const pixels: [number, number, number][] = [
      [255, 0, 0],
      [255, 0, 0],
      [255, 0, 0],
      [0, 0, 255],
    ];
    const palette = extractPalette(rgba(pixels), 2);
    expect(palette[0]).toBe('#ff0000'); // most common first
    expect(palette).toContain('#0000ff');
  });

  it('skips transparent pixels', () => {
    const data = [255, 0, 0, 0, 0, 0, 255, 255]; // transparent red, opaque blue
    expect(extractPalette(data, 6)).toEqual(['#0000ff']);
  });

  it('limits to the requested count', () => {
    const pixels: [number, number, number][] = [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
      [255, 255, 0],
    ];
    expect(extractPalette(rgba(pixels), 2)).toHaveLength(2);
  });
});
