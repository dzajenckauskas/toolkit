import { describe, expect, it } from 'vitest';
import { CATEGORY_ORDER, LIVE_TOOLS, TOOLS, searchTools, toolsByCategory } from './registry';

describe('tool registry', () => {
  it('has unique ids and hrefs', () => {
    expect(new Set(TOOLS.map((t) => t.id)).size).toBe(TOOLS.length);
    expect(new Set(TOOLS.map((t) => t.href)).size).toBe(TOOLS.length);
  });

  it('every tool has a known category', () => {
    for (const tool of TOOLS) {
      expect(CATEGORY_ORDER).toContain(tool.category);
    }
  });

  it('groups by category in display order, skipping empties', () => {
    const groups = toolsByCategory();
    expect(groups.length).toBeGreaterThan(0);
    const order = groups.map((g) => g.category);
    // categories appear in CATEGORY_ORDER order
    expect(order).toEqual(CATEGORY_ORDER.filter((c) => order.includes(c)));
    expect(groups.reduce((n, g) => n + g.tools.length, 0)).toBe(TOOLS.length);
  });

  it('search matches name, description, and category (case-insensitive)', () => {
    expect(searchTools('qr').some((t) => t.id === 'qr')).toBe(true);
    expect(searchTools('EXIF').some((t) => t.id === 'metadata-cleaner')).toBe(true);
    expect(searchTools('developer').every((t) => t.category === 'Developer')).toBe(true);
    expect(searchTools('')).toHaveLength(TOOLS.length);
    expect(searchTools('zzzznotarealtool')).toHaveLength(0);
  });

  it('exposes the live tools', () => {
    expect(LIVE_TOOLS.every((t) => t.status === 'live')).toBe(true);
    expect(LIVE_TOOLS.map((t) => t.id)).toEqual(
      expect.arrayContaining([
        'optimize',
        'crop',
        'uuid',
        'base64',
        'password',
        'lorem-ipsum',
        'json',
        'hash',
        'jwt',
        'regex',
        'colors',
        'text-diff',
        'focus-timer',
        'calculator',
        'resize',
        'convert',
        'rotate',
      ]),
    );
  });
});
