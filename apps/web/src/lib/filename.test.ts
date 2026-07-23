import { describe, expect, it } from 'vitest';
import { generateOutputFilename } from './filename';

describe('generateOutputFilename', () => {
  it('inserts the suffix before a simple extension', () => {
    expect(generateOutputFilename('photo.jpg')).toBe('photo-optimized.jpg');
  });

  it('preserves the original extension casing', () => {
    expect(generateOutputFilename('photo.JPEG')).toBe('photo-optimized.JPEG');
  });

  it('only splits on the final dot', () => {
    expect(generateOutputFilename('my.photo.v2.jpg')).toBe('my.photo.v2-optimized.jpg');
  });

  it('adds a default .jpg extension when none is present', () => {
    expect(generateOutputFilename('noext')).toBe('noext-optimized.jpg');
  });

  it('treats a leading-dot dotfile as having no extension', () => {
    expect(generateOutputFilename('.gitignore')).toBe('.gitignore-optimized.jpg');
  });

  it('falls back to a base name for empty or whitespace input', () => {
    expect(generateOutputFilename('   ')).toBe('image-optimized.jpg');
    expect(generateOutputFilename('')).toBe('image-optimized.jpg');
  });

  it('accepts a custom suffix', () => {
    expect(generateOutputFilename('photo.jpg', 'small')).toBe('photo-small.jpg');
  });
});
