import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';

const sampleJpeg = resolve(__dirname, 'fixtures/sample.jpg');

async function readDims(page: import('@playwright/test').Page) {
  const text = (await page.getByTestId('crop-dimensions').textContent()) ?? '';
  const match = text.match(/(\d+)\s*×\s*(\d+)/);
  return match ? { w: Number(match[1]), h: Number(match[2]) } : { w: 0, h: 0 };
}

test.beforeEach(async ({ page }) => {
  await page.goto('/crop');
});

test('shows the dropzone and no crop box before an image is added', async ({ page }) => {
  await expect(page.getByTestId('crop-dropzone')).toBeVisible();
  await expect(page.getByTestId('crop-box')).toHaveCount(0);
});

test('loads a JPEG and shows a default centered crop', async ({ page }) => {
  await page.getByTestId('crop-file-input').setInputFiles(sampleJpeg);

  await expect(page.getByTestId('crop-box')).toBeVisible();
  await expect(page.getByTestId('crop-source')).toContainText('900 × 700');
  // Default crop is 80% of a 900×700 image.
  expect(await readDims(page)).toEqual({ w: 720, h: 560 });
});

test('resizing the SE handle shrinks the output dimensions', async ({ page }) => {
  await page.getByTestId('crop-file-input').setInputFiles(sampleJpeg);
  await expect(page.getByTestId('crop-box')).toBeVisible();
  const before = await readDims(page);

  const handle = page.getByTestId('crop-handle-se');
  await handle.scrollIntoViewIfNeeded();
  const box = await handle.boundingBox();
  if (!box) throw new Error('SE handle not found');
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx - 60, cy - 60, { steps: 6 });
  await page.mouse.up();

  const after = await readDims(page);
  expect(after.w).toBeLessThan(before.w);
  expect(after.h).toBeLessThan(before.h);
});

test('aspect-ratio presets constrain the crop', async ({ page }) => {
  await page.getByTestId('crop-file-input').setInputFiles(sampleJpeg);
  await expect(page.getByTestId('crop-box')).toBeVisible();

  await page.getByTestId('crop-ratio-1:1').check();
  const square = await readDims(page);
  expect(square.w).toBe(square.h);

  await page.getByTestId('crop-ratio-16:9').check();
  const wide = await readDims(page);
  expect(wide.w / wide.h).toBeCloseTo(16 / 9, 1);

  await page.getByTestId('crop-ratio-free').check();
});

test('export size preset rescales the output dimensions', async ({ page }) => {
  await page.getByTestId('crop-file-input').setInputFiles(sampleJpeg);
  await expect(page.getByTestId('crop-box')).toBeVisible();
  expect(await readDims(page)).toEqual({ w: 720, h: 560 }); // Original

  await page.getByTestId('crop-export-1024').check();
  const scaled = await readDims(page);
  expect(Math.max(scaled.w, scaled.h)).toBe(1024);

  await page.getByTestId('crop-export-original').check();
  expect(await readDims(page)).toEqual({ w: 720, h: 560 });
});

test('a marketplace preset locks the ratio and forces the exact output size', async ({ page }) => {
  await page.getByTestId('crop-file-input').setInputFiles(sampleJpeg);
  await expect(page.getByTestId('crop-box')).toBeVisible();

  // Amazon 2000×2000: square ratio, exact output regardless of the crop rect.
  await page.getByTestId('crop-preset-amazon-2000').check();
  expect(await readDims(page)).toEqual({ w: 2000, h: 2000 });

  // The free aspect-ratio and export-size controls are superseded (disabled).
  await expect(page.getByTestId('crop-ratio-16:9')).toBeDisabled();
  await expect(page.getByTestId('crop-export-1024')).toBeDisabled();

  // A portrait preset yields its exact non-square size.
  await page.getByTestId('crop-preset-instagram-1080x1350').check();
  expect(await readDims(page)).toEqual({ w: 1080, h: 1350 });

  // Clearing the preset re-enables the free controls and drops the forced size.
  await page.getByTestId('crop-preset-none').check();
  await expect(page.getByTestId('crop-ratio-16:9')).toBeEnabled();
  expect(await readDims(page)).not.toEqual({ w: 1080, h: 1350 });
});

test('zoom magnifies the workspace without changing the crop output', async ({ page }) => {
  await page.getByTestId('crop-file-input').setInputFiles(sampleJpeg);
  await expect(page.getByTestId('crop-box')).toBeVisible();
  const before = await readDims(page);

  const image = page.getByTestId('crop-image');
  const w1 = (await image.boundingBox())?.width ?? 0;

  await page.getByTestId('crop-zoom-2').check();
  const w2 = (await image.boundingBox())?.width ?? 0;
  expect(w2).toBeGreaterThan(w1 * 1.5);

  // The crop output is in source pixels, so zoom does not change it.
  expect(await readDims(page)).toEqual(before);
});

test('downloads the cropped image as a JPEG', async ({ page }) => {
  await page.getByTestId('crop-file-input').setInputFiles(sampleJpeg);
  await expect(page.getByTestId('crop-download')).toBeEnabled();

  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('crop-download').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('sample-cropped.jpg');
});
