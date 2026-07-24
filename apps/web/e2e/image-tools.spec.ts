import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';

const sampleJpeg = resolve(__dirname, 'fixtures/sample.jpg');

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
