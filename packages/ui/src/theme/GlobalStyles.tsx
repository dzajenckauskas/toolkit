'use client';

import { Global, css } from '@emotion/react';

/**
 * The only global CSS in the app: a minimal reset, base typography, the colour
 * tokens (with a manual light/dark override that beats prefers-color-scheme),
 * and shared base styling for native form controls so every select / input /
 * range / checkbox looks consistent without per-component work.
 */

// Palette ported from the danielius design system. Light follows the printed
// CV — a warm off-white paper with a muted teal/sage "ink" accent; dark is a
// restrained blue-slate companion. `--accent` is danielius' `--ink`,
// `--accent-strong` its `--ink-strong` (accent hover), and `--subtle` its
// third-tier text. Radii are large and soft (pill buttons, rounded cards).
const LIGHT = `
  --bg: #f7f5f2;
  --surface: #ffffff;
  --surface-2: #f2efea;
  --border: #e5e1da;
  --border-strong: #d6d0c6;
  --text: #191a1c;
  --muted: #55585c;
  --subtle: #8b8e92;
  --accent: #4f736e;
  --accent-strong: #3d5b57;
  --accent-contrast: #ffffff;
  --danger-bg: #fbecee;
  --danger-border: #e7b3bb;
  --danger-text: #a23a4c;
  --overlay: rgba(25, 26, 28, 0.42);
  --shadow: 0 22px 55px -48px rgba(25, 26, 28, 0.55);
`;

const DARK = `
  --bg: #1b212c;
  --surface: #232a37;
  --surface-2: #1f2531;
  --border: #333b49;
  --border-strong: #414b5c;
  --text: #f2f0ec;
  --muted: #a7adb8;
  --subtle: #737b88;
  --accent: #93bcb5;
  --accent-strong: #b6d6d0;
  --accent-contrast: #12201d;
  --danger-bg: #3a2126;
  --danger-border: #6b3540;
  --danger-text: #eca9b3;
  --overlay: rgba(0, 0, 0, 0.62);
  --shadow: 0 26px 60px -50px rgba(0, 0, 0, 0.75);
`;

// Radii + fluid tokens shared by both themes (danielius: utility 1.1rem,
// card 1.5rem, feature 2rem, inputs ~0.85rem, pill buttons).
const TOKENS = `
  --radius-sm: 0.7rem;
  --radius-md: 1.1rem;
  --radius-lg: 1.5rem;
  --radius-xl: 2rem;
  --radius-pill: 999px;
`;

// A muted chevron for native <select>, tinted to read on both themes.
const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none' stroke='%237b8494' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 1l5 5 5-5'/%3E%3C/svg%3E\")";

export function GlobalStyles() {
  return (
    <Global
      styles={css`
        :root {
          color-scheme: light;
          ${TOKENS}
          ${LIGHT}
        }
        :root[data-theme='dark'] {
          color-scheme: dark;
          ${DARK}
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme='light']) {
            color-scheme: dark;
            ${DARK}
          }
        }

        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
        }

        /* Always reserve space for the vertical scrollbar so centered layouts
           (the catalog, search results, the FAQ accordion) keep a constant
           width whether or not the page currently overflows — no width jump when
           a search filters the list or an FAQ item expands. */
        html {
          scrollbar-gutter: stable;
        }

        body {
          /* Column layout lets the footer sit at the bottom on short pages
             (Footer uses margin-top: auto). */
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          background: var(--bg);
          color: var(--text);
          font-family:
            var(--font-neris),
            var(--font-geist-sans),
            ui-sans-serif,
            system-ui,
            -apple-system,
            'Segoe UI',
            Roboto,
            sans-serif;
          font-weight: 300;
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        /* Respect the OS "reduce motion" setting for the theme transition. */
        @media (prefers-reduced-motion: no-preference) {
          body {
            transition:
              background-color 0.2s ease,
              color 0.2s ease;
          }
        }

        /* --- Native form controls: consistent, themed defaults --- */
        button,
        input,
        select,
        textarea {
          min-width: 0;
          max-width: 100%;
          font-family: inherit;
          font-size: 1rem;
          color: var(--text);
        }

        /* Consistent affordances for native buttons across every tool. Styled
           components set their own cursor/disabled treatment and still win; this
           only upgrades anything that doesn't. */
        button:not(:disabled) {
          cursor: pointer;
        }
        button:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }

        select {
          appearance: none;
          -webkit-appearance: none;
          padding: 0.55rem 2.1rem 0.55rem 0.8rem;
          color: var(--text);
          background-color: var(--surface);
          background-image: ${CHEVRON};
          background-repeat: no-repeat;
          background-position: right 0.7rem center;
          border: 1px solid var(--border-strong);
          border-radius: 0.85rem;
          cursor: pointer;
          line-height: 1.2;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }
        select:hover {
          border-color: var(--accent);
        }

        /* Base styling for text-like inputs and textareas. Components can
           override this baseline, but attribute selectors are intentionally
           specific enough that exceptional padding may need a scoped
           higher-specificity rule (as in the catalog search). */
        input[type='text'],
        input[type='search'],
        input[type='email'],
        input[type='url'],
        input[type='tel'],
        input[type='password'],
        input[type='number'],
        input[type='datetime-local'],
        input:not([type]),
        textarea {
          padding: 0.55rem 0.8rem;
          color: var(--text);
          background-color: var(--surface);
          border: 1px solid var(--border-strong);
          border-radius: 0.85rem;
          line-height: 1.4;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }
        textarea {
          resize: vertical;
        }
        input[type='text']:hover,
        input[type='search']:hover,
        input[type='email']:hover,
        input[type='url']:hover,
        input[type='tel']:hover,
        input[type='password']:hover,
        input[type='number']:hover,
        input:not([type]):hover,
        textarea:hover {
          border-color: var(--accent);
        }

        input[type='range'] {
          accent-color: var(--accent);
          cursor: pointer;
          height: 1.4rem;
        }

        /* Keep Chromium's useful number steppers, but make them follow the
           active light/dark theme instead of rendering as a bright native box.
           Firefox inherits the same theme through color-scheme. */
        input[type='number']::-webkit-inner-spin-button {
          opacity: 0.72;
          cursor: ns-resize;
        }
        input[type='number']:hover::-webkit-inner-spin-button,
        input[type='number']:focus::-webkit-inner-spin-button {
          opacity: 1;
        }

        input[type='checkbox'],
        input[type='radio'] {
          accent-color: var(--accent);
          width: 1rem;
          height: 1rem;
          cursor: pointer;
        }

        input[type='color'] {
          -webkit-appearance: none;
          appearance: none;
          width: 2.4rem;
          height: 2.4rem;
          padding: 0;
          border: 1px solid var(--border-strong);
          border-radius: 0.85rem;
          background: none;
          cursor: pointer;
        }
        input[type='color']::-webkit-color-swatch-wrapper {
          padding: 3px;
        }
        input[type='color']::-webkit-color-swatch {
          border: none;
          border-radius: 0.6rem;
        }

        input[type='file'] {
          color: var(--muted);
          font-size: 0.9rem;
        }
        input[type='file']::file-selector-button {
          font: inherit;
          margin-right: 0.75rem;
          padding: 0.45rem 0.9rem;
          color: var(--text);
          background: var(--surface-2);
          border: 1px solid var(--border-strong);
          border-radius: var(--radius-pill);
          cursor: pointer;
        }
        input[type='file']::file-selector-button:hover {
          border-color: var(--accent);
        }

        /* Consistent focus ring for anything focusable that doesn't set its own —
           danielius' soft ink halo (subtle tint) plus an accent border. */
        select:focus-visible,
        input:focus-visible,
        textarea:focus-visible {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
        }

        ::placeholder {
          color: var(--muted);
          opacity: 0.8;
        }
      `}
    />
  );
}
