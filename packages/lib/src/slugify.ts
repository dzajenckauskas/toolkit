/**
 * Slugify text into URL-friendly form. Strips diacritics via Unicode
 * normalisation, then collapses everything else to a separator. Pure.
 */

export interface SlugifyOptions {
  separator?: string;
  lower?: boolean;
}

// Combining diacritical marks (U+0300–U+036F) left behind by NFKD.
const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g');

export function slugify(text: string, options: SlugifyOptions = {}): string {
  const separator = options.separator ?? '-';
  const lower = options.lower ?? true;

  let result = text
    .normalize('NFKD')
    .replace(COMBINING_MARKS, '')
    .replace(/[^a-zA-Z0-9]+/g, separator);

  // Trim leading/trailing separators.
  const escaped = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  result = result.replace(new RegExp(`^${escaped}+|${escaped}+$`, 'g'), '');

  return lower ? result.toLowerCase() : result;
}
