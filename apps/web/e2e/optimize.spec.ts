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

test('downloads all optimized images as a single ZIP', async ({ page }) => {
  await page.getByTestId('file-input').setInputFiles([sampleJpeg, sampleJpeg]);
  await expect(page.getByTestId('item-download')).toHaveCount(2);

  const download = page.getByTestId('download-all');
  await expect(download).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await download.click();
  const zip = await downloadPromise;
  expect(zip.suggestedFilename()).toBe('optimized-images.zip');
});

test('does not offer a ZIP for a single image', async ({ page }) => {
  await page.getByTestId('file-input').setInputFiles(sampleJpeg);
  await expect(page.getByTestId('item-download')).toBeVisible();
  await expect(page.getByTestId('download-all')).toHaveCount(0);
});

test('accepts a JPEG pasted from the clipboard', async ({ page }) => {
  await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#c33';
    ctx.fillRect(0, 0, 48, 32);
    const blob: Blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9),
    );
    const file = new File([blob], 'pasted.jpg', { type: 'image/jpeg' });
    const dt = new DataTransfer();
    dt.items.add(file);
    window.dispatchEvent(
      new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }),
    );
  });

  await expect(page.getByTestId('item-download')).toBeVisible();
  await expect(page.getByTestId('item-meta')).toContainText('48×32');
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

test('accepts a PNG, keeps the format, and disables the lossy quality control', async ({
  page,
}) => {
  await page.getByTestId('file-input').setInputFiles(resolve(__dirname, 'fixtures/sample.png'));

  const download = page.getByTestId('item-download');
  await expect(download).toBeVisible();
  // Format is preserved: a PNG in stays a PNG out.
  await expect(download).toHaveAttribute('download', 'sample-optimized.png');
  await expect(page.getByTestId('item-meta')).toContainText('200×150');
  await expect(page.getByTestId('item-error')).toHaveCount(0);

  // PNG is lossless, so the compression control doesn't apply (its radios,
  // disabled via the surrounding fieldset, are not interactive).
  await expect(page.getByTestId('quality-balanced')).toBeDisabled();
  await expect(page.getByTestId('quality-note')).toBeVisible();
});
