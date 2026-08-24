import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const sampleJpeg = resolve(__dirname, 'fixtures/sample.jpg'); // 900 × 700
const samplePng = resolve(__dirname, 'fixtures/sample.png'); // 200 × 150
const transparentPng = resolve(__dirname, 'fixtures/transparent.png');
const corruptJpeg = resolve(__dirname, 'fixtures/corrupt.jpg');

test('Resize loads an image, seeds the width field, and locks aspect ratio', async ({ page }) => {
  await page.goto('/resize');
  await page.getByTestId('resize-file-input').setInputFiles(sampleJpeg);

  // Fields seed to the source size once the first file finishes processing.
  await expect(page.getByTestId('resize-width')).toHaveValue('900');
  await expect(page.getByTestId('item-meta')).toContainText('900×700');

  // With aspect locked, halving the width halves the height (900×700 → 450×350).
  await page.getByTestId('resize-width').fill('450');
  await expect(page.getByTestId('resize-height')).toHaveValue('350');
  await expect(page.getByTestId('item-meta')).toContainText('450×350');

  const download = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('item-download').click(),
  ]);
  expect(download[0].suggestedFilename()).toMatch(/-resized\.png$/);
});

test("Resize applies the same target width to a batch, preserving each file's own aspect ratio", async ({
  page,
}) => {
  await page.goto('/resize');
  // 900×700 and 200×150 have different aspect ratios, so a correct per-file
  // recompute produces two different heights at the same target width.
  await page.getByTestId('resize-file-input').setInputFiles([sampleJpeg, samplePng]);
  await expect(page.getByTestId('item-download')).toHaveCount(2);

  await page.getByTestId('resize-width').fill('100');
  await expect(page.getByTestId('item-meta').nth(0)).toContainText('100×78');
  await expect(page.getByTestId('item-meta').nth(1)).toContainText('100×75');

  const zip = page.getByTestId('resize-download-all');
  await expect(zip).toBeVisible();
  const download = await Promise.all([page.waitForEvent('download'), zip.click()]);
  expect(download[0].suggestedFilename()).toBe('resized-images.zip');
});

test('Resize surfaces a per-file error without blocking the rest of the batch', async ({
  page,
}) => {
  await page.goto('/resize');
  await page.getByTestId('resize-file-input').setInputFiles([sampleJpeg, corruptJpeg]);

  await expect(page.getByTestId('item-download')).toHaveCount(1);
  await expect(page.getByTestId('item-error')).toBeVisible();
  await expect(page.getByTestId('item-retry')).toBeVisible();
});

test('Convert changes the output format and downloads', async ({ page }) => {
  await page.goto('/convert');
  await page.getByTestId('convert-file-input').setInputFiles(sampleJpeg);
  await expect(page.getByTestId('item-download')).toHaveAttribute('download', /\.png$/);

  await page.getByTestId('convert-format').selectOption('webp');
  // Changing a setting reprocesses the batch in the background; wait for the
  // new output before downloading rather than racing the in-flight re-encode.
  await expect(page.getByTestId('item-download')).toHaveAttribute('download', /\.webp$/);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('item-download').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/-converted\.webp$/);
});

test('Convert fills a transparent PNG with white (not black) when exporting to JPEG', async ({
  page,
}) => {
  await page.goto('/convert');
  await page.getByTestId('convert-file-input').setInputFiles(transparentPng);
  await page.getByTestId('convert-format').selectOption('jpeg');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('item-download').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/-converted\.jpg$/);

  // Decode the exported JPEG in the browser and sample a pixel. The source is
  // fully transparent, so a correct fill makes it white; the old bug left the
  // canvas unpainted and the JPEG encoder filled transparency with black.
  const path = await download.path();
  const dataUrl = `data:image/jpeg;base64,${readFileSync(path).toString('base64')}`;
  const [r, g, b] = await page.evaluate(async (src) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(Math.floor(img.width / 2), Math.floor(img.height / 2), 1, 1);
    return [data[0], data[1], data[2]];
  }, dataUrl);

  // Near-white after lossy JPEG encoding, and unambiguously not black.
  expect(r).toBeGreaterThan(240);
  expect(g).toBeGreaterThan(240);
  expect(b).toBeGreaterThan(240);
});

test('Convert processes a batch and downloads all as a ZIP', async ({ page }) => {
  await page.goto('/convert');
  await page.getByTestId('convert-file-input').setInputFiles([sampleJpeg, samplePng]);
  await page.getByTestId('convert-format').selectOption('webp');
  await expect(page.getByTestId('item-download')).toHaveCount(2);

  const zip = page.getByTestId('convert-download-all');
  const download = await Promise.all([page.waitForEvent('download'), zip.click()]);
  expect(download[0].suggestedFilename()).toBe('converted-images.zip');
});

test('Rotate swaps dimensions and downloads', async ({ page }) => {
  await page.goto('/rotate');
  await page.getByTestId('rotate-file-input').setInputFiles(sampleJpeg);
  await expect(page.getByTestId('item-meta')).toContainText('900×700');

  await page.getByTestId('rotate-cw').click();
  await expect(page.getByTestId('rotate-output')).toContainText('90°');
  await expect(page.getByTestId('item-meta')).toContainText('700×900');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('item-download').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/-rotated\.png$/);
});

test('Rotate applies the same transform to a batch', async ({ page }) => {
  await page.goto('/rotate');
  await page.getByTestId('rotate-file-input').setInputFiles([sampleJpeg, samplePng]);
  await expect(page.getByTestId('item-download')).toHaveCount(2);

  await page.getByTestId('rotate-cw').click();
  await expect(page.getByTestId('item-meta').nth(0)).toContainText('700×900');
  await expect(page.getByTestId('item-meta').nth(1)).toContainText('150×200');

  const zip = page.getByTestId('rotate-download-all');
  const download = await Promise.all([page.waitForEvent('download'), zip.click()]);
  expect(download[0].suggestedFilename()).toBe('rotated-images.zip');
});
