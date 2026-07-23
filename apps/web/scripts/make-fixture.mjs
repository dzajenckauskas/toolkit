/**
 * Generate a real, detailed JPEG fixture for the Playwright suite using the
 * pre-installed Chromium. A high-detail, high-quality source ensures that
 * re-encoding at the balanced 0.8 default actually reduces the file size,
 * so the browser test can assert a real saving.
 *
 * Run: node scripts/make-fixture.mjs
 */
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../e2e/fixtures');
const outFile = resolve(outDir, 'sample.jpg');

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium',
});
const page = await browser.newPage();

const dataUrl = await page.evaluate(() => {
  const w = 900;
  const h = 700;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(w, h);
  // High-frequency pseudo-random detail so a lossy re-encode has room to save.
  let seed = 1337;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let i = 0; i < img.data.length; i += 4) {
    const px = (i / 4) % w;
    const py = Math.floor(i / 4 / w);
    const wave = Math.sin(px / 7) * Math.cos(py / 11) * 80 + 128;
    img.data[i] = Math.min(255, Math.max(0, wave + rand() * 90));
    img.data[i + 1] = Math.min(255, Math.max(0, 200 - wave + rand() * 90));
    img.data[i + 2] = Math.min(255, Math.max(0, (px ^ py) & 0xff));
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.98);
});

const base64 = dataUrl.split(',')[1];
mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, Buffer.from(base64, 'base64'));
console.log(`Wrote ${outFile} (${Buffer.from(base64, 'base64').length} bytes)`);

await browser.close();
