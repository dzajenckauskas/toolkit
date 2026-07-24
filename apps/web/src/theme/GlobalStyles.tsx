'use client';

import { Global, css } from '@emotion/react';

/**
 * The only global CSS in the app: a minimal reset, base typography, the colour
 * tokens (with a manual light/dark override that beats prefers-color-scheme),
 * and shared base styling for native form controls so every select / input /
 * range / checkbox looks consistent without per-component work.
 */

const LIGHT = `
  --bg: #f6f7f9;
  --surface: #ffffff;
  --surface-2: #f0f2f5;
  --border: #e2e6ec;
  --border-strong: #c3cad4;
  --text: #171c24;
  --muted: #5b6675;
  --accent: #2563eb;
  --accent-contrast: #ffffff;
  --danger-bg: #fdecec;
  --danger-border: #f3b4b4;
  --danger-text: #9b1c1c;
  --overlay: rgba(17, 22, 30, 0.45);
  --shadow: 0 10px 30px rgba(17, 24, 39, 0.12);
`;

const DARK = `
  --bg: #0c0f14;
  --surface: #151a21;
  --surface-2: #1c222b;
  --border: #262d38;
  --border-strong: #3a4351;
  --text: #e7ecf3;
  --muted: #97a2b2;
  --accent: #5b9bff;
  --accent-contrast: #0b0e13;
  --danger-bg: #3a1d1d;
  --danger-border: #6b2b2b;
  --danger-text: #f7b4b4;
  --overlay: rgba(0, 0, 0, 0.6);
  --shadow: 0 12px 34px rgba(0, 0, 0, 0.5);
`;

// A muted chevron for native <select>, tinted to read on both themes.
const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none' stroke='%237b8494' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 1l5 5 5-5'/%3E%3C/svg%3E\")";

export function GlobalStyles() {
  return (
    <Global
      styles={css`
        :root {
          ${LIGHT}
        }
        :root[data-theme='dark'] {
          ${DARK}
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme='light']) {
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

        body {
          background: var(--bg);
          color: var(--text);
          font-family:
            system-ui,
            -apple-system,
            'Segoe UI',
            Roboto,
            sans-serif;
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
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
          font-family: inherit;
          font-size: 1rem;
          color: var(--text);
        }

        select {
          appearance: none;
          -webkit-appearance: none;
          padding: 0.5rem 2.1rem 0.5rem 0.75rem;
          color: var(--text);
          background-color: var(--surface);
          background-image: ${CHEVRON};
          background-repeat: no-repeat;
          background-position: right 0.7rem center;
          border: 1px solid var(--border-strong);
          border-radius: 10px;
          cursor: pointer;
          line-height: 1.2;
        }
        select:hover {
          border-color: var(--accent);
        }

        input[type='range'] {
          accent-color: var(--accent);
          cursor: pointer;
          height: 1.4rem;
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
          border-radius: 10px;
          background: none;
          cursor: pointer;
        }
        input[type='color']::-webkit-color-swatch-wrapper {
          padding: 3px;
        }
        input[type='color']::-webkit-color-swatch {
          border: none;
          border-radius: 6px;
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
          border-radius: 10px;
          cursor: pointer;
        }
        input[type='file']::file-selector-button:hover {
          border-color: var(--accent);
        }

        /* Consistent focus ring for anything focusable that doesn't set its own. */
        select:focus-visible,
        input:focus-visible,
        textarea:focus-visible {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 32%, transparent);
        }

        ::placeholder {
          color: var(--muted);
          opacity: 0.8;
        }
      `}
    />
  );
}
