// Generate a branded 1200×630 cover image for each blog post.
//
// Renders an on-brand HTML template in Chromium (via Playwright) and screenshots
// it to apps/web/public/blog/covers/<slug>.png. Run after adding or renaming a
// post: `node apps/web/scripts/generate-blog-covers.mjs`. Committed PNGs are what
// ship; this script just reproduces them.
//
// The cover is a brand graphic, not a repeat of the card: the real header logo
// mark (same SVG paths as components/layout/Logo.tsx) on the accent gradient,
// with only the category label in the site font (Neris). No title, no wordmark.

import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = join(HERE, '..');
const CONTENT_DIR = join(WEB_ROOT, 'content', 'blog');
const OUT_DIR = join(WEB_ROOT, 'public', 'blog', 'covers');
const FONT_DIR = join(WEB_ROOT, 'public', 'fonts', 'neris');

const fontUrl = (file) => pathToFileURL(join(FONT_DIR, file)).href;

// The exact glasses mark from components/layout/Logo.tsx (same paths, viewBox,
// stroke width) so the cover logo matches the header logo.
const GLASSES_VIEWBOX = '24.6 32.3 51.2 15';
const GLASSES_PATHS = [
  'M 51.73 38.76 L 52.15 38.49 L 50.95 38.91 L 52.29 38.45 L 52.36 38.45 L 52.22 38.61 L 52.01 38.71 L 51.8 38.76 L 51.59 38.65 L 51.37 38.34 L 51.16 37.93 L 50.88 37.46 L 50.45 36.99 L 49.96 36.52 L 49.47 36.01 L 48.97 35.27 L 48.33 34.66 L 47.63 34.4 L 46.57 34.34 L 45.51 34.5 L 44.38 34.66 L 43.1 34.92 L 41.9 35.18 L 40.84 35.54 L 39.92 36.16 L 39.15 36.99 L 38.37 37.83 L 37.66 38.8 L 37.24 39.85 L 37.17 40.88 L 37.45 42.08 L 38.44 43.22 L 39.92 44.15 L 41.76 44.87 L 43.81 45.29 L 45.79 45.29 L 47.84 44.93 L 49.75 44.15 L 51.09 43.11 L 51.94 42.08 L 52.15 41.09 L 52.01 40.06 L 51.37 38.76 L 50.95 37.98',
  'M 67.42 36.16 L 67.21 36.1 L 66.78 36.06 L 66.57 35.91 L 66.22 35.69 L 65.58 35.59 L 64.52 35.59 L 63.25 35.75 L 61.76 36.1 L 60.63 36.52 L 59.78 37.1 L 59.01 37.98 L 58.3 39.02 L 57.66 40.15 L 57.38 41.15 L 57.45 41.98 L 58.09 42.91 L 59.36 43.9 L 60.99 44.68 L 62.96 45.14 L 64.87 45.24 L 66.5 45.03 L 67.77 44.36 L 68.76 43.37 L 69.47 42.34 L 69.96 41.34 L 70.17 40.41 L 69.96 39.64 L 69.26 38.76 L 68.34 37.67 L 67.42 36.52 L 66.5 35.59 L 65.65 35.12',
  'M 52.5 39.02 L 52.36 39.02 L 52.22 38.96 L 52.22 38.86 L 52.29 38.71 L 52.36 38.65 L 52.5 38.61 L 52.58 38.61 L 52.58 38.54 L 52.65 38.49 L 52.79 38.39 L 53.07 38.24 L 53.42 38.13 L 53.99 38.08 L 54.84 38.03 L 55.83 38.03 L 56.82 38.39 L 57.1 38.54',
  'M 70.88 40.47 L 70.74 40.56 L 70.6 40.56 L 70.53 40.63 L 70.74 40.52 L 71.23 40.41 L 71.73 40.26 L 72.29 40.26 L 72.93 40.32 L 73.71 40.52 L 73.85 40.63',
  'M 27.84 37.71 L 27.56 37.71 L 27.84 37.71 L 27.2 37.71 L 26.99 37.88 L 26.78 38.03 L 26.64 38.13 L 26.64 38.18 L 26.78 38.24 L 27.2 38.34 L 28.19 38.39 L 29.68 38.39 L 31.94 38.49 L 33.85 38.71',
];

/** Minimal frontmatter read — just the fields the cover needs. */
function readMeta(raw) {
  const match = /^---\n([\s\S]*?)\n---/.exec(raw.replace(/\r\n/g, '\n'));
  const data = {};
  if (match) {
    for (const line of match[1].split('\n')) {
      const i = line.indexOf(':');
      if (i === -1) continue;
      let v = line.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      data[line.slice(0, i).trim()] = v;
    }
  }
  return data;
}

/** Deterministic 0..1 from a string, so a post's glow placement is stable. */
function hash01(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

const GLASSES_ASPECT = 51.2 / 15;

function coverHtml({ slug, category }) {
  const markHeight = 132;
  const markWidth = Math.round(markHeight * GLASSES_ASPECT);
  // Vary the soft highlight position per post for subtle uniqueness.
  const gx = Math.round(18 + hash01(slug) * 64);
  const gy = Math.round(12 + hash01(`${slug}y`) * 40);
  const paths = GLASSES_PATHS.map((d) => `<path d="${d}"/>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @font-face { font-family: 'Neris'; font-weight: 600; src: url('${fontUrl('Neris-SemiBold.woff2')}') format('woff2'); }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 1200px; height: 630px; }
    .cover {
      position: relative; width: 1200px; height: 630px; overflow: hidden;
      background: linear-gradient(135deg, #4f736e 0%, #3d5b57 100%);
      font-family: 'Neris', system-ui, sans-serif;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 44px;
    }
    .glow {
      position: absolute; top: ${gy}%; left: ${gx}%; transform: translate(-50%, -50%);
      width: 760px; height: 760px;
      background: radial-gradient(circle at center, rgba(243,239,232,0.16), rgba(243,239,232,0) 68%);
      pointer-events: none;
    }
    .mark { position: relative; }
    .category {
      position: relative;
      font-weight: 600; font-size: 27px; letter-spacing: 0.18em; text-transform: uppercase;
      color: rgba(243,239,232,0.92);
    }
  </style></head><body>
    <div class="cover">
      <div class="glow"></div>
      <svg class="mark" width="${markWidth}" height="${markHeight}" viewBox="${GLASSES_VIEWBOX}"
        fill="none" stroke="#f3efe8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>
      <div class="category">${escapeHtml(category)}</div>
    </div>
  </body></html>`;
}

function escapeHtml(s) {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  );
}

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'));

  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium',
  });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const meta = readMeta(readFileSync(join(CONTENT_DIR, file), 'utf8'));
    await page.setContent(coverHtml({ slug, category: meta.category ?? '' }), {
      waitUntil: 'load',
    });
    await page.evaluate(() => document.fonts.ready);
    const png = await page.screenshot({ clip: { x: 0, y: 0, width: 1200, height: 630 } });
    writeFileSync(join(OUT_DIR, `${slug}.png`), png);
    console.log(`cover: ${slug}.png`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
