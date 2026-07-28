import { describe, expect, it } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('strips diacritics', () => {
    expect(slugify('Crème brûlée')).toBe('creme-brulee');
    expect(slugify('Žabą')).toBe('zaba');
  });

  it('collapses punctuation and trims separators', () => {
    expect(slugify('  --Hello,   World!!  ')).toBe('hello-world');
  });

  it('supports a custom separator and case', () => {
    expect(slugify('Hello World', { separator: '_' })).toBe('hello_world');
    expect(slugify('Hello World', { lower: false })).toBe('Hello-World');
  });

  it('handles empty and symbol-only input', () => {
    expect(slugify('')).toBe('');
    expect(slugify('!!!')).toBe('');
  });
});
