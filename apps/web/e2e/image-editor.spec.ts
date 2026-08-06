import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';

const sampleJpeg = resolve(__dirname, 'fixtures/sample.jpg');

test.beforeEach(async ({ page }) => {
  await page.goto('/image-editor');
});

test('shows the dropzone before an image is added', async ({ page }) => {
  await expect(page.getByTestId('image-editor-dropzone')).toBeVisible();
  await expect(page.getByTestId('editor-panel')).toHaveCount(0);
});

test('loads an image and reports its dimensions', async ({ page }) => {
  await page.getByTestId('image-editor-file-input').setInputFiles(sampleJpeg);
  await expect(page.getByTestId('editor-dimensions')).toContainText('900 × 700');
  await expect(page.getByTestId('editor-panel')).toBeVisible();
});

test('resize controls stay inside the panel on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.getByTestId('image-editor-file-input').setInputFiles(sampleJpeg);
  await page.getByTestId('editor-tab-resize').click();

  const panel = await page.getByTestId('editor-panel').boundingBox();
  const widthInput = await page.getByTestId('editor-resize-width').boundingBox();
  const heightInput = await page.getByTestId('editor-resize-height').boundingBox();

  expect(panel).not.toBeNull();
  expect(widthInput).not.toBeNull();
  expect(heightInput).not.toBeNull();
  expect(widthInput!.x).toBeGreaterThanOrEqual(panel!.x);
  expect(heightInput!.x + heightInput!.width).toBeLessThanOrEqual(panel!.x + panel!.width);
  expect(widthInput!.width).toBeGreaterThan(60);
  expect(heightInput!.width).toBeGreaterThan(60);
});

test('resize with locked aspect updates the working dimensions', async ({ page }) => {
  await page.getByTestId('image-editor-file-input').setInputFiles(sampleJpeg);
  await page.getByTestId('editor-tab-resize').click();
  await page.getByTestId('editor-resize-width').fill('450');
  await page.getByTestId('editor-resize-height').blur();
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page.getByTestId('editor-dimensions')).toContainText('450 × 350');
});

test('applying the default crop reduces the image to 80%', async ({ page }) => {
  await page.getByTestId('image-editor-file-input').setInputFiles(sampleJpeg);
  await page.getByTestId('editor-tab-crop').click();
  await expect(page.getByTestId('editor-crop-box')).toBeVisible();
  await page.getByTestId('editor-crop-ratio').waitFor();
  await page.getByRole('button', { name: 'Apply crop' }).click();
  // Default crop is 80% of 900×700.
  await expect(page.getByTestId('editor-dimensions')).toContainText('720 × 560');
});

test('rotating right swaps width and height', async ({ page }) => {
  await page.getByTestId('image-editor-file-input').setInputFiles(sampleJpeg);
  await page.getByTestId('editor-tab-rotate').click();
  await page.getByTestId('editor-rotate-right').click();
  await expect(page.getByTestId('editor-dimensions')).toContainText('700 × 900');
});

test('downloads the edited image as <name>-edited.<ext>', async ({ page }) => {
  await page.getByTestId('image-editor-file-input').setInputFiles(sampleJpeg);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('editor-download').click(),
  ]);
  expect(download.suggestedFilename()).toBe('sample-edited.jpg');
});

test('undo reverts the last operation', async ({ page }) => {
  await page.getByTestId('image-editor-file-input').setInputFiles(sampleJpeg);
  await page.getByTestId('editor-tab-rotate').click();
  await page.getByTestId('editor-rotate-right').click();
  await expect(page.getByTestId('editor-dimensions')).toContainText('700 × 900');
  await page.getByTestId('editor-undo').click();
  await expect(page.getByTestId('editor-dimensions')).toContainText('900 × 700');
});
