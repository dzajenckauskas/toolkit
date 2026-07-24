import { describe, expect, it } from 'vitest';
import { runRegex } from './regex';

describe('regex', () => {
  it('finds all matches with indices', () => {
    const result = runRegex('\\d+', '', 'a1 b22 c333');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.matches.map((m) => m.match)).toEqual(['1', '22', '333']);
      expect(result.matches[0]!.index).toBe(1);
    }
  });

  it('captures groups', () => {
    const result = runRegex('(\\w)(\\d)', '', 'a1 b2');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.matches[0]!.groups).toEqual(['a', '1']);
  });

  it('honors flags (case-insensitive)', () => {
    const result = runRegex('abc', 'i', 'ABC abc');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.matches).toHaveLength(2);
  });

  it('reports invalid patterns', () => {
    const result = runRegex('(', '', 'x');
    expect(result.ok).toBe(false);
  });

  it('does not hang on zero-length matches', () => {
    const result = runRegex('a*', '', 'aa b');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.matches.length).toBeGreaterThan(0);
  });

  it('returns no matches for an empty pattern', () => {
    const result = runRegex('', '', 'anything');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.matches).toHaveLength(0);
  });
});
