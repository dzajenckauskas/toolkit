import { describe, expect, it } from 'vitest';
import { buildTheme, contrastColor, themeToCss } from './theme-maker';

describe('theme-maker', () => {
  it('builds light and dark themes with the accent', () => {
    const light = buildTheme('#3366cc', 'light');
    const dark = buildTheme('#3366cc', 'dark');
    expect(light.accent).toBe('#3366cc');
    expect(light.bg).toBe('#ffffff');
    expect(dark.bg).toBe('#0b0d10');
  });

  it('picks a readable accent-contrast colour', () => {
    expect(contrastColor({ r: 0, g: 0, b: 0 })).toBe('#ffffff');
    expect(contrastColor({ r: 255, g: 255, b: 255 })).toBe('#000000');
  });

  it('falls back to a default accent for invalid input', () => {
    expect(buildTheme('nope', 'light').accent).toBe('#3366cc');
  });

  it('exports CSS variables for both modes', () => {
    const css = themeToCss(buildTheme('#3366cc', 'light'), buildTheme('#3366cc', 'dark'));
    expect(css).toContain(':root {');
    expect(css).toContain('--accent: #3366cc;');
    expect(css).toContain('@media (prefers-color-scheme: dark)');
  });
});
