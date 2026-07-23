'use client';

import { Global, css } from '@emotion/react';

/**
 * The only global CSS in the app: a minimal reset, base typography, and the
 * color-token custom properties with a light/dark block. Everything else is
 * styled per-component via Emotion. (Replaces the former app/globals.css.)
 */
export function GlobalStyles() {
  return (
    <Global
      styles={css`
        :root {
          --bg: #f7f8fa;
          --surface: #ffffff;
          --border: #d9dde3;
          --border-strong: #b7bec8;
          --text: #1c2430;
          --muted: #5b6675;
          --accent: #1f6feb;
          --accent-contrast: #ffffff;
          --danger-bg: #fdecec;
          --danger-border: #f3b4b4;
          --danger-text: #9b1c1c;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --bg: #0e1116;
            --surface: #161b22;
            --border: #2a313c;
            --border-strong: #3b4453;
            --text: #e6ebf2;
            --muted: #9aa4b2;
            --accent: #4c8dff;
            --accent-contrast: #0e1116;
            --danger-bg: #3a1d1d;
            --danger-border: #6b2b2b;
            --danger-text: #f7b4b4;
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
        }
      `}
    />
  );
}
