import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const sampleJpeg = resolve(__dirname, 'fixtures/sample.jpg');
const transparentPng = resolve(__dirname, 'fixtures/transparent.png');

test('Resize loads an image, seeds size, and locks aspect ratio', async ({ page }) => {
  await page.goto('/resize');
  await page.getByTestId('resize-file-input').setInputFiles(sampleJpeg);

  await expect(page.getByTestId('resize-source')).toContainText('900 × 700');
  // Fields seed to the source size.
  await expect(page.getByTestId('resize-width')).toHaveValue('900');

  // With aspect locked, halving the width halves the height (900×700 → 450×350).
  await page.getByTestId('resize-width').fill('450');
  await expect(page.getByTestId('resize-height')).toHaveValue('350');
  await expect(page.getByTestId('resize-output')).toContainText('450 × 350');

  const download = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('resize-download').click(),
  ]);
  expect(download[0].suggestedFilename()).toMatch(/-resized\.png$/);
});

test('Convert changes the output format and downloads', async ({ page }) => {
  await page.goto('/convert');
  await page.getByTestId('convert-file-input').setInputFiles(sampleJpeg);
  await page.getByTestId('convert-format').selectOption('webp');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('convert-download').click(),
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
    page.getByTestId('convert-download').click(),
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

test('Rotate swaps dimensions and downloads', async ({ page }) => {
  await page.goto('/rotate');
  await page.getByTestId('rotate-file-input').setInputFiles(sampleJpeg);
  await expect(page.getByTestId('rotate-output')).toContainText('900 × 700');

  await page.getByTestId('rotate-cw').click();
  await expect(page.getByTestId('rotate-output')).toContainText('700 × 900');
  await expect(page.getByTestId('rotate-output')).toContainText('90°');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('rotate-download').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/-rotated\.png$/);
});
