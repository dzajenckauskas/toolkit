// Generate a branded 1200×630 cover image for each blog post.
//
// Renders an on-brand HTML template in Chromium (via Playwright) and screenshots
// it to apps/web/public/blog/covers/<slug>.png. Run after adding or renaming a
// post: `node apps/web/scripts/generate-blog-covers.mjs`. Committed PNGs are what
// ship; this script just reproduces them. Uses real Chromium so the local Neris
// woff2 font renders exactly as it does on the site.

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

function titleSize(title) {
  if (title.length > 58) return 50;
  if (title.length > 44) return 58;
  return 68;
}

function coverHtml({ title, category }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @font-face { font-family: 'Neris'; font-weight: 600; src: url('${fontUrl('Neris-SemiBold.woff2')}') format('woff2'); }
    @font-face { font-family: 'Neris'; font-weight: 900; src: url('${fontUrl('Neris-Black.woff2')}') format('woff2'); }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 1200px; height: 630px; }
    .cover {
      position: relative; width: 1200px; height: 630px; overflow: hidden;
      background: #f3efe8; color: #1b1d1c;
      font-family: 'Neris', system-ui, sans-serif;
      padding: 80px; display: flex; flex-direction: column; justify-content: space-between;
    }
    .glow {
      position: absolute; top: -220px; right: -180px; width: 720px; height: 720px;
      background: radial-gradient(circle at center, rgba(79,115,110,0.28), rgba(79,115,110,0) 70%);
      pointer-events: none;
    }
    .brand { display: flex; align-items: center; gap: 16px; position: relative; }
    .wordmark { font-weight: 900; font-size: 30px; letter-spacing: -0.02em; }
    .mid { position: relative; }
    .eyebrow {
      font-weight: 600; font-size: 22px; letter-spacing: 0.14em; text-transform: uppercase;
      color: #3d5b57; margin-bottom: 24px;
    }
    .title {
      font-weight: 900; letter-spacing: -0.02em; line-height: 1.06;
      max-width: 940px; font-size: ${titleSize(title)}px;
    }
    .foot { display: flex; align-items: center; gap: 14px; position: relative; color: #55585c; font-weight: 600; font-size: 24px; }
    .dot { width: 12px; height: 12px; border-radius: 50%; background: #4f736e; }
  </style></head><body>
    <div class="cover">
      <div class="glow"></div>
      <div class="brand">
        <svg width="92" height="34" viewBox="0 0 92 34" fill="none" stroke="#1b1d1c" stroke-width="4" stroke-linecap="round">
          <circle cx="30" cy="17" r="13"/><circle cx="70" cy="17" r="13"/>
          <path d="M43 17h14"/><path d="M2 17h15"/><path d="M83 17h7"/>
        </svg>
        <span class="wordmark">toolkit</span>
      </div>
      <div class="mid">
        <div class="eyebrow">${escapeHtml(category)}</div>
        <h1 class="title">${escapeHtml(title)}</h1>
      </div>
      <div class="foot"><span class="dot"></span><span>toolkit.zajenckauskas.lt/blog</span></div>
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
    await page.setContent(coverHtml({ title: meta.title ?? slug, category: meta.category ?? '' }), {
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
