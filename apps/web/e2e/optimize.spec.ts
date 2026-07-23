import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';

// Playwright transpiles specs to CommonJS, so __dirname is available and
// import.meta is not. Resolve fixtures relative to this file.
const sampleJpeg = resolve(__dirname, 'fixtures/sample.jpg');

test.beforeEach(async ({ page }) => {
  await page.goto('/optimize');
});

test('optimizes a JPEG end to end and offers a download', async ({ page }) => {
  await page.getByTestId('file-input').setInputFiles(sampleJpeg);

  const results = page.getByTestId('results');
  await expect(results).toBeVisible();

  // Detected info from the real decode.
  await expect(page.getByTestId('dimensions')).toHaveText('900 × 700 px');
  await expect(page.getByTestId('original-size')).toContainText('KB');
  await expect(page.getByTestId('optimized-size')).toContainText('KB');

  // The detailed 609 KB source shrinks at the balanced default.
  await expect(page.getByTestId('savings')).toContainText('% smaller');

  // Download is present, named, and points at an object URL.
  const download = page.getByTestId('download');
  await expect(download).toHaveAttribute('download', 'sample-optimized.jpg');
  await expect(download).toHaveAttribute('href', /^blob:/);

  // No error surfaced on the happy path.
  await expect(page.getByTestId('error')).toHaveCount(0);
});

test('actually downloads the optimized file when clicked', async ({ page }) => {
  await page.getByTestId('file-input').setInputFiles(sampleJpeg);
  await expect(page.getByTestId('results')).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('download').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('sample-optimized.jpg');
});

test('quality control re-optimizes and changes the output size', async ({ page }) => {
  await page.getByTestId('file-input').setInputFiles(sampleJpeg);
  await expect(page.getByTestId('results')).toBeVisible();

  // Balanced is the default so the fast path is unchanged.
  await expect(page.getByTestId('quality-balanced')).toBeChecked();

  const readKb = async () => {
    const text = (await page.getByTestId('optimized-size').textContent()) ?? '';
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  };

  const balancedKb = await readKb();
  expect(balancedKb).toBeGreaterThan(0);

  // Higher quality -> larger file.
  await page.getByTestId('quality-high').check();
  await expect(page.getByTestId('quality-high')).toBeChecked();
  await expect.poll(readKb).toBeGreaterThan(balancedKb);

  // Lower quality -> smaller file.
  await page.getByTestId('quality-low').check();
  await expect.poll(readKb).toBeLessThan(balancedKb);

  // The download name is unaffected by the quality choice.
  await expect(page.getByTestId('download')).toHaveAttribute('download', 'sample-optimized.jpg');
  await expect(page.getByTestId('download')).toHaveAttribute('href', /^blob:/);
});

test('shows a clear error for a corrupt JPEG', async ({ page }) => {
  await page.getByTestId('file-input').setInputFiles({
    name: 'broken.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('this is not a real jpeg at all'),
  });

  const error = page.getByTestId('error');
  await expect(error).toBeVisible();
  await expect(error).toContainText(/could not be read|corrupt/i);
  await expect(page.getByTestId('results')).toHaveCount(0);
});

test('rejects an unsupported (PNG) file before processing', async ({ page }) => {
  await page.getByTestId('file-input').setInputFiles({
    name: 'logo.png',
    mimeType: 'image/png',
    buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  });

  const error = page.getByTestId('error');
  await expect(error).toBeVisible();
  await expect(error).toContainText(/JPEG/);
});
