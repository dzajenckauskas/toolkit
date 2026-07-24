/**
 * Lorem Ipsum placeholder-text generation. Deterministic word bank, random
 * assembly into sentences and paragraphs. Pure — no platform dependencies.
 */

const WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'duis',
  'aute',
  'irure',
  'in',
  'reprehenderit',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'fugiat',
  'nulla',
  'pariatur',
  'excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'non',
  'proident',
  'sunt',
  'culpa',
  'qui',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'id',
  'est',
  'laborum',
];

export const MAX_PARAGRAPHS = 50;

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function word(): string {
  return WORDS[randInt(0, WORDS.length - 1)]!;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** One sentence: 6–14 words, capitalized, ending in a period. */
export function sentence(): string {
  const count = randInt(6, 14);
  const words = Array.from({ length: count }, word);
  return `${capitalize(words.join(' '))}.`;
}

/** One paragraph of 3–6 sentences. */
export function paragraph(): string {
  const count = randInt(3, 6);
  return Array.from({ length: count }, sentence).join(' ');
}

/**
 * Generate `count` paragraphs (clamped to 1..MAX_PARAGRAPHS). The first
 * paragraph starts with the classic "Lorem ipsum dolor sit amet" when
 * `classicStart` is set (default true).
 */
export function generateParagraphs(count: number, classicStart = true): string[] {
  const n = Math.min(Math.max(Math.floor(count) || 1, 1), MAX_PARAGRAPHS);
  const paragraphs = Array.from({ length: n }, paragraph);
  if (classicStart && paragraphs.length > 0) {
    paragraphs[0] = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. ${paragraphs[0]}`;
  }
  return paragraphs;
}
