/**
 * HTML entity encode/decode. Encoding escapes the five characters that matter
 * for safe HTML. Decoding handles the common named entities plus any numeric
 * reference (decimal &#123; or hex &#x1F;). Pure; works anywhere.
 */

const ENCODE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const NAMED_DECODE: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  '#39': "'",
  nbsp: ' ',
  copy: '©',
  reg: '®',
  trade: '™',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  euro: '€',
  pound: '£',
  cent: '¢',
  deg: '°',
};

export function encodeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ENCODE_MAP[char] ?? char);
}

export function decodeHtml(text: string): string {
  return text.replace(/&(#x?[0-9a-f]+|[a-z0-9]+);/gi, (match, body: string) => {
    if (body[0] === '#') {
      const codePoint =
        body[1] === 'x' || body[1] === 'X'
          ? parseInt(body.slice(2), 16)
          : parseInt(body.slice(1), 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
    const named = NAMED_DECODE[body.toLowerCase()];
    return named ?? match;
  });
}
