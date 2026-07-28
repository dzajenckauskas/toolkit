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
    /** Third-tier text (danielius `--subtle`): meta labels, captions. */
    subtle: 'var(--subtle)',
    /** Ink accent (danielius `--ink`). */
    accent: 'var(--accent)',
    /** Ink accent, hover/darker (danielius `--ink-strong`). */
    accentStrong: 'var(--accent-strong)',
    accentContrast: 'var(--accent-contrast)',
    dangerBg: 'var(--danger-bg)',
    dangerBorder: 'var(--danger-border)',
    dangerText: 'var(--danger-text)',
    overlay: 'var(--overlay)',
  },
  shadow: 'var(--shadow)',
  radius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    pill: 'var(--radius-pill)',
  },
  /** Spacing helper: space(3) -> "0.75rem" (4px grid). */
  space: (steps: number): string => `${steps * 0.25}rem`,
  font: {
    /** Neris display/body sans with Geist + system fallbacks. */
    body: "var(--font-neris), var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    /** Geist Mono for numerals and meta labels. */
    mono: "var(--font-geist-mono), ui-monospace, 'SFMono-Regular', 'Menlo', monospace",
  },
  breakpoint: {
    sm: '480px',
  },
} as const;

export type AppTheme = typeof theme;
