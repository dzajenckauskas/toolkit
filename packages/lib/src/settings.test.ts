import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_CONVERT_SETTINGS,
  DEFAULT_RESIZE_SETTINGS,
  DEFAULT_ROTATE_SETTINGS,
  deletePreset,
  loadConvertSettings,
  loadQualityLevel,
  loadResizeSettings,
  loadRotateSettings,
  listPresets,
  savePreset,
  saveConvertSettings,
  saveQualityLevel,
  saveResizeSettings,
  saveRotateSettings,
} from './settings';
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

describe('resize settings persistence', () => {
  it('returns the default when nothing is stored', () => {
    expect(loadResizeSettings()).toEqual(DEFAULT_RESIZE_SETTINGS);
  });

  it('round-trips a saved settings object', () => {
    saveResizeSettings({ format: 'webp', keepAspect: false });
    expect(loadResizeSettings()).toEqual({ format: 'webp', keepAspect: false });
  });

  it('falls back per-field for a corrupt stored value', () => {
    localStorage.setItem('toolkit:resize:settings', JSON.stringify({ format: 'nonsense' }));
    expect(loadResizeSettings()).toEqual(DEFAULT_RESIZE_SETTINGS);
  });

  it('falls back to the default when storage holds non-JSON', () => {
    localStorage.setItem('toolkit:resize:settings', 'not json');
    expect(loadResizeSettings()).toEqual(DEFAULT_RESIZE_SETTINGS);
  });

  it('does not throw when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });
    expect(loadResizeSettings()).toEqual(DEFAULT_RESIZE_SETTINGS);
    expect(() => saveResizeSettings({ format: 'jpeg', keepAspect: true })).not.toThrow();
  });
});

describe('convert settings persistence', () => {
  it('returns the default when nothing is stored', () => {
    expect(loadConvertSettings()).toEqual(DEFAULT_CONVERT_SETTINGS);
  });

  it('round-trips a saved settings object', () => {
    saveConvertSettings({ format: 'jpeg', quality: 0.6 });
    expect(loadConvertSettings()).toEqual({ format: 'jpeg', quality: 0.6 });
  });

  it('falls back to the default quality for an out-of-range value', () => {
    localStorage.setItem(
      'toolkit:convert:settings',
      JSON.stringify({ format: 'jpeg', quality: 4 }),
    );
    expect(loadConvertSettings()).toEqual({
      format: 'jpeg',
      quality: DEFAULT_CONVERT_SETTINGS.quality,
    });
  });
});

describe('rotate settings persistence', () => {
  it('returns the default when nothing is stored', () => {
    expect(loadRotateSettings()).toEqual(DEFAULT_ROTATE_SETTINGS);
  });

  it('round-trips a saved settings object', () => {
    saveRotateSettings({ format: 'webp' });
    expect(loadRotateSettings()).toEqual({ format: 'webp' });
  });
});

describe('named presets', () => {
  it('returns an empty list when nothing is saved', () => {
    expect(listPresets('resize')).toEqual([]);
  });

  it('saves and lists a preset', () => {
    savePreset('resize', 'Etsy listing', { format: 'webp', keepAspect: true });
    expect(listPresets('resize')).toEqual([
      { name: 'Etsy listing', settings: { format: 'webp', keepAspect: true } },
    ]);
  });

  it('overwrites a preset saved again under the same name', () => {
    savePreset('resize', 'Etsy listing', { format: 'webp', keepAspect: true });
    savePreset('resize', 'Etsy listing', { format: 'png', keepAspect: false });
    expect(listPresets('resize')).toEqual([
      { name: 'Etsy listing', settings: { format: 'png', keepAspect: false } },
    ]);
  });

  it('trims the name and ignores a blank name', () => {
    savePreset('resize', '  Padded  ', { format: 'png', keepAspect: true });
    savePreset('resize', '   ', { format: 'jpeg', keepAspect: true });
    expect(listPresets('resize')).toEqual([
      { name: 'Padded', settings: { format: 'png', keepAspect: true } },
    ]);
  });

  it('keeps presets separate per tool', () => {
    savePreset('resize', 'Shared name', { format: 'webp', keepAspect: true });
    savePreset('convert', 'Shared name', { format: 'jpeg', quality: 0.8 });
    expect(listPresets('resize')).toEqual([
      { name: 'Shared name', settings: { format: 'webp', keepAspect: true } },
    ]);
    expect(listPresets('convert')).toEqual([
      { name: 'Shared name', settings: { format: 'jpeg', quality: 0.8 } },
    ]);
  });

  it('deletes a preset by name', () => {
    savePreset('resize', 'Etsy listing', { format: 'webp', keepAspect: true });
    deletePreset('resize', 'Etsy listing');
    expect(listPresets('resize')).toEqual([]);
  });

  it('ignores malformed entries in a corrupted preset list', () => {
    localStorage.setItem('toolkit:presets:resize', JSON.stringify([{ noName: true }, 'garbage']));
    expect(listPresets('resize')).toEqual([]);
  });

  it('does not throw when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });
    expect(() => savePreset('resize', 'Etsy listing', { format: 'webp' })).not.toThrow();
    expect(listPresets('resize')).toEqual([]);
  });
});
