/**
 * Design tokens.
 *
 * Colors are exposed as CSS custom properties (defined in GlobalStyles, with a
 * light/dark `prefers-color-scheme` block) so theming — including automatic
 * dark mode — needs zero JavaScript. The typed `theme` object below simply
 * gives styled components ergonomic, autocompleted access to those tokens.
 */
export const theme = {
  color: {
    bg: 'var(--bg)',
    surface: 'var(--surface)',
    surface2: 'var(--surface-2)',
    border: 'var(--border)',
    borderStrong: 'var(--border-strong)',
    text: 'var(--text)',
    muted: 'var(--muted)',
    accent: 'var(--accent)',
    accentContrast: 'var(--accent-contrast)',
    dangerBg: 'var(--danger-bg)',
    dangerBorder: 'var(--danger-border)',
    dangerText: 'var(--danger-text)',
    overlay: 'var(--overlay)',
  },
  shadow: 'var(--shadow)',
  radius: {
    sm: '6px',
    md: '10px',
    pill: '999px',
  },
  /** Spacing helper: space(3) -> "0.75rem" (4px grid). */
  space: (steps: number): string => `${steps * 0.25}rem`,
  font: {
    body: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  },
  breakpoint: {
    sm: '480px',
  },
} as const;

export type AppTheme = typeof theme;
