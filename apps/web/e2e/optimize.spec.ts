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

  await expect(page.getByTestId('results')).toBeVisible();

  const meta = page.getByTestId('item-meta');
  await expect(meta).toBeVisible();
  await expect(meta).toContainText('900×700');
  await expect(page.getByTestId('item-original')).toContainText('KB');
  await expect(page.getByTestId('item-optimized')).toContainText('KB');
  await expect(page.getByTestId('item-savings')).toContainText('% smaller');

  const download = page.getByTestId('item-download');
  await expect(download).toHaveAttribute('download', 'sample-optimized.jpg');
  await expect(download).toHaveAttribute('href', /^blob:/);

  await expect(page.getByTestId('item-error')).toHaveCount(0);
});

test('actually downloads the optimized file when clicked', async ({ page }) => {
  await page.getByTestId('file-input').setInputFiles(sampleJpeg);
  await expect(page.getByTestId('item-download')).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('item-download').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('sample-optimized.jpg');
});

test('optimizes multiple JPEGs in one batch', async ({ page }) => {
  await page.getByTestId('file-input').setInputFiles([sampleJpeg, sampleJpeg]);

  // Both files reach a downloadable result.
  await expect(page.getByTestId('item-download')).toHaveCount(2);
  await expect(page.getByTestId('item-optimized')).toHaveCount(2);
  await expect(page.getByTestId('status')).toContainText('2 images optimized');
});

test('quality control re-optimizes and changes the output size', async ({ page }) => {
  await page.getByTestId('file-input').setInputFiles(sampleJpeg);
  await expect(page.getByTestId('item-download')).toBeVisible();
  await expect(page.getByTestId('quality-balanced')).toBeChecked();

  const readKb = async () => {
    const text = (await page.getByTestId('item-optimized').textContent()) ?? '';
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  };

  const balancedKb = await readKb();
  expect(balancedKb).toBeGreaterThan(0);

  await page.getByTestId('quality-high').check();
  await expect.poll(readKb).toBeGreaterThan(balancedKb);

  await page.getByTestId('quality-low').check();
  await expect.poll(readKb).toBeLessThan(balancedKb);
});

test('remembers the last-used quality across a reload', async ({ page }) => {
  await expect(page.getByTestId('quality-balanced')).toBeChecked();

  await page.getByTestId('quality-high').check();
  await expect(page.getByTestId('quality-high')).toBeChecked();

  await page.reload();

  // The stored preference is restored on load.
  await expect(page.getByTestId('quality-high')).toBeChecked();
  await expect(page.getByTestId('quality-balanced')).not.toBeChecked();
});

test('shows a clear per-file error for a corrupt JPEG', async ({ page }) => {
  await page.getByTestId('file-input').setInputFiles({
    name: 'broken.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('this is not a real jpeg at all'),
  });

  const error = page.getByTestId('item-error');
  await expect(error).toBeVisible();
  await expect(error).toContainText(/could not be read|corrupt/i);
});

test('rejects an unsupported (PNG) file per item', async ({ page }) => {
  await page.getByTestId('file-input').setInputFiles({
    name: 'logo.png',
    mimeType: 'image/png',
    buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  });

  const error = page.getByTestId('item-error');
  await expect(error).toBeVisible();
  await expect(error).toContainText(/JPEG/);
});
