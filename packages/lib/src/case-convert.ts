/**
 * Text case transforms. A single word-splitter feeds all the cases, so
 * "myXMLFile name" tokenises consistently. Pure; works anywhere.
 */

export type CaseName =
  'lower' | 'upper' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant';

export const CASE_LABELS: Record<CaseName, string> = {
  lower: 'lower case',
  upper: 'UPPER CASE',
  title: 'Title Case',
  sentence: 'Sentence case',
  camel: 'camelCase',
  pascal: 'PascalCase',
  snake: 'snake_case',
  kebab: 'kebab-case',
  constant: 'CONSTANT_CASE',
};

/** Split into words across spaces, punctuation, and camelCase boundaries. */
export function words(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);
}

const cap = (word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

export function convertCase(input: string, target: CaseName): string {
  const parts = words(input);
  switch (target) {
    case 'lower':
      return input.toLowerCase();
    case 'upper':
      return input.toUpperCase();
    case 'title':
      return parts.map(cap).join(' ');
    case 'sentence': {
      const joined = parts.map((w) => w.toLowerCase()).join(' ');
      return joined ? joined.charAt(0).toUpperCase() + joined.slice(1) : '';
    }
    case 'camel':
      return parts.map((w, i) => (i === 0 ? w.toLowerCase() : cap(w))).join('');
    case 'pascal':
      return parts.map(cap).join('');
    case 'snake':
      return parts.map((w) => w.toLowerCase()).join('_');
    case 'kebab':
      return parts.map((w) => w.toLowerCase()).join('-');
    case 'constant':
      return parts.map((w) => w.toUpperCase()).join('_');
  }
}
