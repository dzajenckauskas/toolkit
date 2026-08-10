import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const sampleJpeg = resolve(__dirname, 'fixtures/sample.jpg');
const sampleJpegBytes = readFileSync(sampleJpeg);

test('Kanban board adds and moves cards', async ({ page }) => {
  // Use a fresh storage state so the board starts empty.
  await page.addInitScript(() => localStorage.removeItem('toolkit:kanban'));
  await page.goto('/kanban');

  await page.getByTestId('kanban-input-todo').fill('Write tests');
  await page.getByTestId('kanban-add-todo').click();
  await expect(page.getByTestId('kanban-col-todo')).toContainText('Write tests');
  await expect(page.getByTestId('kanban-col-todo')).toContainText('To do (1)');

  // Move the card to the next column.
  await page.getByTestId('kanban-col-todo').getByTestId('kanban-move-right').click();
  await expect(page.getByTestId('kanban-col-doing')).toContainText('Write tests');
  await expect(page.getByTestId('kanban-col-todo')).toContainText('To do (0)');
});

test('Screenshot beautifier frames an image and downloads', async ({ page }) => {
  await page.goto('/screenshot');
  await page.getByTestId('ss-file-input').setInputFiles(sampleJpeg);
  await expect(page.getByTestId('ss-preview')).toBeVisible();
  await page.getByTestId('ss-bg-ocean').click();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('ss-download').click(),
  ]);
  expect(download.suggestedFilename()).toBe('screenshot.png');
});

test('Images to PDF reorders images and builds a PDF', async ({ page }) => {
  await page.goto('/images-to-pdf');
  await page.getByTestId('pdf-file-input').setInputFiles(
    ['first.jpg', 'second.jpg', 'third.jpg'].map((name) => ({
      name,
      mimeType: 'image/jpeg',
      buffer: sampleJpegBytes,
    })),
  );
  const thumbs = page.getByTestId('pdf-thumb');
  await expect(thumbs).toHaveCount(3);

  const uploadCta = page.getByTestId('pdf-dropzone-cta');
  const downloadButton = page.getByTestId('pdf-download');
  await expect(uploadCta.locator('svg')).toHaveCount(0);
  const sharedStyles = await Promise.all(
    [uploadCta, downloadButton].map((control) =>
      control.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          paddingTop: style.paddingTop,
          paddingBottom: style.paddingBottom,
          fontSize: style.fontSize,
          lineHeight: style.lineHeight,
        };
      }),
    ),
  );
  expect(sharedStyles[0]).toEqual(sharedStyles[1]);

  for (const control of [uploadCta, downloadButton]) {
    const textOffset = await control.evaluate((element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let textNode = walker.nextNode();
      while (textNode && !textNode.textContent?.trim()) textNode = walker.nextNode();
      if (!textNode) return Number.POSITIVE_INFINITY;
      const range = document.createRange();
      range.selectNodeContents(textNode);
      const textBox = range.getBoundingClientRect();
      const controlBox = element.getBoundingClientRect();
      return textBox.top + textBox.height / 2 - (controlBox.top + controlBox.height / 2);
    });
    expect(Math.abs(textOffset)).toBeLessThanOrEqual(2);
  }

  await expect(thumbs.first().locator('img')).toHaveCSS('aspect-ratio', '4 / 5');
  await expect(thumbs.first().locator('img')).toHaveCSS('object-fit', 'cover');

  const actionTops = await page
    .getByTestId('pdf-thumb-actions')
    .evaluateAll((actions) => actions.map((action) => action.getBoundingClientRect().top));
  expect(new Set(actionTops).size).toBe(1);

  await thumbs.first().getByRole('button', { name: 'Preview first.jpg' }).click();
  const preview = page.getByRole('dialog', { name: 'Image preview' });
  await expect(preview).toBeVisible();
  await expect(preview.getByRole('img', { name: 'Full-size preview of first.jpg' })).toBeVisible();
  await preview.getByRole('button', { name: 'Close' }).click();
  await expect(preview).toBeHidden();

  const thumbBox = await thumbs.first().boundingBox();
  expect(thumbBox).not.toBeNull();
  for (const button of await thumbs.first().getByRole('button').all()) {
    const buttonBox = await button.boundingBox();
    const iconBox = await button.locator('svg').boundingBox();
    expect(buttonBox).not.toBeNull();
    expect(iconBox).not.toBeNull();
    expect(buttonBox!.x).toBeGreaterThanOrEqual(thumbBox!.x);
    expect(buttonBox!.x + buttonBox!.width).toBeLessThanOrEqual(thumbBox!.x + thumbBox!.width);
    const buttonCenter = buttonBox!.y + buttonBox!.height / 2;
    const iconCenter = iconBox!.y + iconBox!.height / 2;
    expect(Math.abs(buttonCenter - iconCenter)).toBeLessThanOrEqual(1);
  }

  await thumbs.nth(0).dragTo(thumbs.nth(2));
  await expect
    .poll(() => thumbs.locator('img').evaluateAll((images) => images.map((image) => image.alt)))
    .toEqual(['second.jpg', 'third.jpg', 'first.jpg']);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('pdf-download').click(),
  ]);
  expect(download.suggestedFilename()).toBe('images.pdf');
});
