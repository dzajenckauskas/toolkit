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

test('downloads the cropped image as a JPEG', async ({ page }) => {
  await page.getByTestId('crop-file-input').setInputFiles(sampleJpeg);
  await expect(page.getByTestId('crop-download')).toBeEnabled();

  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('crop-download').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('sample-cropped.jpg');
});
