import { describe, expect, it } from 'vitest';
import {
  dedupeLines,
  lineStats,
  removeEmptyLines,
  reverseLines,
  sortLines,
  trimLines,
} from './line-tools';

describe('line-tools', () => {
  it('sorts ascending and descending', () => {
    expect(sortLines('banana\napple\ncherry')).toBe('apple\nbanana\ncherry');
    expect(sortLines('banana\napple\ncherry', 'desc')).toBe('cherry\nbanana\napple');
  });

  it('removes duplicate lines, keeping first occurrence', () => {
    expect(dedupeLines('a\nb\na\nc\nb')).toBe('a\nb\nc');
  });

  it('reverses line order', () => {
    expect(reverseLines('1\n2\n3')).toBe('3\n2\n1');
  });

  it('trims and removes empty lines', () => {
    expect(trimLines('  a  \n b')).toBe('a\nb');
    expect(removeEmptyLines('a\n\n  \nb')).toBe('a\nb');
  });

  it('reports line stats', () => {
    expect(lineStats('a\nb\n\na')).toEqual({ lines: 4, nonEmpty: 3, unique: 3 });
  });
});
