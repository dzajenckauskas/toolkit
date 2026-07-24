/**
 * Build a small semantic colour theme (light + dark) from a single accent
 * colour, and export it as CSS custom properties. Pure; works anywhere.
 */

import { parseHex, type Rgb } from './color';
import { relativeLuminance } from './contrast';

export interface Theme {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  accentContrast: string;
}

export type ThemeMode = 'light' | 'dark';

const NEUTRALS: Record<ThemeMode, Omit<Theme, 'accent' | 'accentContrast'>> = {
  light: {
    bg: '#ffffff',
    surface: '#f6f7f9',
    text: '#1a1d21',
    muted: '#6b7280',
    border: '#e5e7eb',
  },
  dark: {
    bg: '#0b0d10',
    surface: '#15181d',
    text: '#f2f4f7',
    muted: '#9aa4b2',
    border: '#2a2f37',
  },
};

/** Choose black or white text for a given background colour. */
export function contrastColor(rgb: Rgb): string {
  return relativeLuminance(rgb) > 0.4 ? '#000000' : '#ffffff';
}

/** Build a theme for one mode from an accent hex. Falls back to a blue accent. */
export function buildTheme(accentHex: string, mode: ThemeMode): Theme {
  const rgb = parseHex(accentHex) ?? { r: 51, g: 102, b: 204 };
  const accent = parseHex(accentHex) ? accentHex : '#3366cc';
  return {
    ...NEUTRALS[mode],
    accent,
    accentContrast: contrastColor(rgb),
  };
}

const VARS: [keyof Theme, string][] = [
  ['bg', '--bg'],
  ['surface', '--surface'],
  ['text', '--text'],
  ['muted', '--muted'],
  ['border', '--border'],
  ['accent', '--accent'],
  ['accentContrast', '--accent-contrast'],
];

function block(theme: Theme, indent: string): string {
  return VARS.map(([key, name]) => `${indent}${name}: ${theme[key]};`).join('\n');
}

/** Export both modes as CSS: `:root` for light + a `prefers-color-scheme` block. */
export function themeToCss(light: Theme, dark: Theme): string {
  return [
    ':root {',
    block(light, '  '),
    '}',
    '',
    '@media (prefers-color-scheme: dark) {',
    '  :root {',
    block(dark, '    '),
    '  }',
    '}',
  ].join('\n');
}
