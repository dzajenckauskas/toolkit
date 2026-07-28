import { describe, expect, it } from 'vitest';
import { MAX_PARAGRAPHS, generateParagraphs, paragraph, sentence } from './lorem';

describe('lorem', () => {
  it('sentences are capitalized and end in a period', () => {
    const s = sentence();
    expect(s).toMatch(/^[A-Z]/);
    expect(s.endsWith('.')).toBe(true);
  });

  it('paragraphs contain multiple sentences', () => {
    expect(paragraph().split('. ').length).toBeGreaterThanOrEqual(3);
  });

  it('generates the requested number of paragraphs', () => {
    expect(generateParagraphs(4)).toHaveLength(4);
  });

  it('clamps the count to the allowed range', () => {
    expect(generateParagraphs(0)).toHaveLength(1);
    expect(generateParagraphs(9999)).toHaveLength(MAX_PARAGRAPHS);
  });

  it('starts with the classic opening by default', () => {
    expect(generateParagraphs(1)[0]).toMatch(/^Lorem ipsum dolor sit amet/);
    expect(generateParagraphs(1, false)[0]).not.toMatch(/^Lorem ipsum dolor sit amet, consectetur/);
  });
});
