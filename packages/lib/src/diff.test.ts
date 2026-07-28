import { describe, expect, it } from 'vitest';
import { diffLines, diffStats } from './diff';

describe('diff', () => {
  it('marks identical text as unchanged', () => {
    const lines = diffLines('a\nb\nc', 'a\nb\nc');
    expect(lines.every((l) => l.type === 'same')).toBe(true);
    expect(diffStats(lines)).toEqual({ added: 0, removed: 0, unchanged: 3 });
  });

  it('detects an added line', () => {
    const lines = diffLines('a\nc', 'a\nb\nc');
    expect(lines).toEqual([
      { type: 'same', text: 'a' },
      { type: 'add', text: 'b' },
      { type: 'same', text: 'c' },
    ]);
  });

  it('detects a removed line', () => {
    const lines = diffLines('a\nb\nc', 'a\nc');
    expect(diffStats(lines)).toEqual({ added: 0, removed: 1, unchanged: 2 });
  });

  it('detects a changed line as a delete + add', () => {
    const lines = diffLines('hello', 'world');
    expect(diffStats(lines)).toEqual({ added: 1, removed: 1, unchanged: 0 });
  });

  it('handles empty inputs', () => {
    expect(diffLines('', '')).toEqual([]);
    expect(diffStats(diffLines('', 'x'))).toEqual({ added: 1, removed: 0, unchanged: 0 });
  });
});
