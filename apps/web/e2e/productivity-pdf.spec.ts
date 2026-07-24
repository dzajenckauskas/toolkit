import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';

const sampleJpeg = resolve(__dirname, 'fixtures/sample.jpg');

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

test('Images to PDF builds a PDF from an image', async ({ page }) => {
  await page.goto('/images-to-pdf');
  await page.getByTestId('pdf-file-input').setInputFiles(sampleJpeg);
  await expect(page.getByTestId('pdf-thumb')).toHaveCount(1);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('pdf-download').click(),
  ]);
  expect(download.suggestedFilename()).toBe('images.pdf');
});
