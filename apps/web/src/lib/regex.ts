/**
 * Regular-expression testing helpers. Compiles a user pattern safely and
 * collects matches. Pure; works anywhere RegExp does.
 */

export interface RegexMatch {
  match: string;
  index: number;
  groups: string[];
}

export type RegexResult = { ok: true; matches: RegexMatch[] } | { ok: false; error: string };

/** Ensure the global flag so we can iterate all matches. */
function withGlobal(flags: string): string {
  return flags.includes('g') ? flags : flags + 'g';
}

/**
 * Run `pattern` (with `flags`) against `input`. Returns every match with its
 * index and capture groups, or an error when the pattern/flags are invalid.
 */
export function runRegex(pattern: string, flags: string, input: string): RegexResult {
  if (!pattern) return { ok: true, matches: [] };
  let re: RegExp;
  try {
    re = new RegExp(pattern, withGlobal(flags));
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Invalid pattern' };
  }

  // matchAll requires the global flag (ensured above) and safely advances past
  // zero-length matches on its own, so no manual lastIndex bookkeeping is needed.
  const matches: RegexMatch[] = [];
  for (const m of input.matchAll(re)) {
    matches.push({ match: m[0], index: m.index ?? 0, groups: m.slice(1).map((g) => g ?? '') });
  }
  return { ok: true, matches };
}
