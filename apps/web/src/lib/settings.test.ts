import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadQualityLevel, saveQualityLevel } from './settings';
import { DEFAULT_QUALITY_LEVEL } from './quality';

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('quality level persistence', () => {
  it('returns the default when nothing is stored', () => {
    expect(loadQualityLevel()).toBe(DEFAULT_QUALITY_LEVEL);
  });

  it('round-trips a saved level', () => {
    saveQualityLevel('high');
    expect(loadQualityLevel()).toBe('high');
    saveQualityLevel('low');
    expect(loadQualityLevel()).toBe('low');
  });

  it('falls back to the default for a corrupt stored value', () => {
    localStorage.setItem('toolkit:optimizer:quality', 'nonsense');
    expect(loadQualityLevel()).toBe(DEFAULT_QUALITY_LEVEL);
  });

  it('returns the default and does not throw when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });
    // safeStorage probes with setItem, so this simulates private-mode/disabled storage.
    expect(loadQualityLevel()).toBe(DEFAULT_QUALITY_LEVEL);
    expect(() => saveQualityLevel('high')).not.toThrow();
  });

  it('swallows write failures without throwing', () => {
    // Let the probe succeed but the real write fail (e.g. quota exceeded).
    const original = Storage.prototype.setItem;
    let calls = 0;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
      this: Storage,
      key: string,
      value: string,
    ) {
      calls += 1;
      // First call is the probe (allow); a later real write throws.
      if (calls > 1 && key === 'toolkit:optimizer:quality') {
        throw new Error('quota exceeded');
      }
      return original.call(this, key, value);
    });
    expect(() => saveQualityLevel('low')).not.toThrow();
  });
});
