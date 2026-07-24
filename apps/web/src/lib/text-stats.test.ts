import { describe, expect, it } from 'vitest';
import { textStats } from './text-stats';

describe('text-stats', () => {
  it('counts characters, words and sentences', () => {
    const s = textStats('Hello world. How are you?');
    expect(s.words).toBe(5);
    expect(s.sentences).toBe(2);
    expect(s.characters).toBe(25);
    expect(s.charactersNoSpaces).toBe(21);
  });

  it('counts paragraphs and lines', () => {
    const s = textStats('a\nb\n\nc');
    expect(s.paragraphs).toBe(2);
    expect(s.lines).toBe(4);
  });

  it('counts astral characters as one', () => {
    expect(textStats('🌍').characters).toBe(1);
  });

  it('estimates reading time', () => {
    const words = Array.from({ length: 400 }, () => 'word').join(' ');
    expect(textStats(words).readingTimeMinutes).toBe(2);
  });

  it('handles empty input', () => {
    const s = textStats('');
    expect(s).toMatchObject({ characters: 0, words: 0, sentences: 0, paragraphs: 0, lines: 0 });
  });
});
