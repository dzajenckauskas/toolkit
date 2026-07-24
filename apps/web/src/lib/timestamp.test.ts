import { describe, expect, it } from 'vitest';
import { detectUnit, fromEpoch, relativeTime, toEpoch } from './timestamp';

describe('timestamp', () => {
  it('detects seconds vs milliseconds', () => {
    expect(detectUnit(1_700_000_000)).toBe('seconds');
    expect(detectUnit(1_700_000_000_000)).toBe('ms');
  });

  it('converts an epoch to ISO/UTC', () => {
    const parts = fromEpoch(0, 'seconds');
    expect(parts.iso).toBe('1970-01-01T00:00:00.000Z');
    expect(parts.utc).toBe('Thu, 01 Jan 1970 00:00:00 GMT');
    expect(fromEpoch(1_700_000_000, 'seconds').iso).toBe('2023-11-14T22:13:20.000Z');
  });

  it('parses a date string back to epoch', () => {
    expect(toEpoch('1970-01-01T00:00:00.000Z')).toEqual({ seconds: 0, ms: 0 });
    expect(toEpoch('2023-11-14T22:13:20Z').seconds).toBe(1_700_000_000);
  });

  it('throws on invalid input', () => {
    expect(() => fromEpoch(Number.NaN, 'ms')).toThrow();
    expect(() => toEpoch('not a date')).toThrow();
  });

  it('formats relative time', () => {
    const now = 1_000_000_000_000;
    expect(relativeTime(now, now)).toBe('just now');
    expect(relativeTime(now + 3_600_000, now)).toBe('in 1 hour');
    expect(relativeTime(now - 2 * 86_400_000, now)).toBe('2 days ago');
  });
});
