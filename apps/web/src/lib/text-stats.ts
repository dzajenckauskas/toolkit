/**
 * Text statistics for the word/character counter. Pure; works anywhere.
 */

export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTimeMinutes: number;
}

const WORDS_PER_MINUTE = 200;

export function textStats(text: string): TextStats {
  const words = text.match(/\S+/g)?.length ?? 0;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim() !== '').length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim() !== '').length;
  const lines = text === '' ? 0 : text.replace(/\r\n/g, '\n').split('\n').length;
  return {
    characters: [...text].length,
    charactersNoSpaces: [...text.replace(/\s/g, '')].length,
    words,
    sentences,
    paragraphs,
    lines,
    readingTimeMinutes: words / WORDS_PER_MINUTE,
  };
}
