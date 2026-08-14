import { describe, expect, it } from 'vitest';
import {
  CATEGORY_ORDER,
  LIVE_TOOLS,
  NEW_TOOL_WINDOW_DAYS,
  TOOLS,
  isNewTool,
  searchTools,
  toolBadge,
  toolsByCategory,
  type Tool,
} from './registry';

const base: Tool = {
  id: 't',
  name: 'T',
  description: '',
  href: '/t',
  category: 'Developer',
  status: 'live',
};

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

  it('search matches action-style keywords', () => {
    expect(searchTools('encode').some((t) => t.id === 'base64')).toBe(true);
    expect(searchTools('minify').some((t) => t.id === 'json')).toBe(true);
    expect(searchTools('sha256').some((t) => t.id === 'hash')).toBe(true);
    expect(searchTools('pomodoro').some((t) => t.id === 'focus-timer')).toBe(true);
  });

  it('marks a live tool new only within the launch window', () => {
    const now = new Date('2026-08-12T12:00:00Z');
    const daysAgo = (n: number) =>
      new Date(now.getTime() - n * 86_400_000).toISOString().slice(0, 10);

    expect(isNewTool({ ...base, addedAt: daysAgo(1) }, now)).toBe(true);
    expect(isNewTool({ ...base, addedAt: daysAgo(NEW_TOOL_WINDOW_DAYS - 1) }, now)).toBe(true);
    // At and past the window boundary it is no longer new.
    expect(isNewTool({ ...base, addedAt: daysAgo(NEW_TOOL_WINDOW_DAYS) }, now)).toBe(false);
    expect(isNewTool({ ...base, addedAt: daysAgo(60) }, now)).toBe(false);
    // No date, a future date, or a planned tool never counts as new.
    expect(isNewTool(base, now)).toBe(false);
    expect(isNewTool({ ...base, addedAt: daysAgo(-2) }, now)).toBe(false);
    expect(isNewTool({ ...base, status: 'planned', addedAt: daysAgo(1) }, now)).toBe(false);
  });

  it('resolves a single badge with soon > new > top precedence', () => {
    const now = new Date('2026-08-12T12:00:00Z');
    const recent = new Date(now.getTime() - 2 * 86_400_000).toISOString().slice(0, 10);
    const old = '2020-01-01';

    expect(toolBadge({ ...base, status: 'planned' }, now)).toBe('soon');
    // Planned wins even if flagged featured.
    expect(toolBadge({ ...base, status: 'planned', featured: true }, now)).toBe('soon');
    expect(toolBadge({ ...base, addedAt: recent }, now)).toBe('new');
    // New beats top while inside the window.
    expect(toolBadge({ ...base, addedAt: recent, featured: true }, now)).toBe('new');
    expect(toolBadge({ ...base, featured: true }, now)).toBe('top');
    // A featured tool past its window settles into top.
    expect(toolBadge({ ...base, addedAt: old, featured: true }, now)).toBe('top');
    expect(toolBadge(base, now)).toBe(null);
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
        'checksum',
        'metadata-cleaner',
        'favicon',
      ]),
    );
  });
});
