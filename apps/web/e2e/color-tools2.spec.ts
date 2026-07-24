import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';

const sampleJpeg = resolve(__dirname, 'fixtures/sample.jpg');

test('Palette from image extracts swatches', async ({ page }) => {
  await page.goto('/image-palette');
  await page.getByTestId('imgpal-file-input').setInputFiles(sampleJpeg);
  await expect(page.getByTestId('imgpal-preview')).toBeVisible();
  const swatches = page.getByTestId('imgpal-swatches').locator('button');
  await expect(swatches.first()).toBeVisible();
  expect(await swatches.count()).toBeGreaterThan(0);
});

test('Color blindness simulator shows all vision rows', async ({ page }) => {
  await page.goto('/color-blindness');
  await expect(page.getByTestId('cvd-row-normal')).toBeVisible();
  await expect(page.getByTestId('cvd-row-protanopia')).toBeVisible();
  await expect(page.getByTestId('cvd-row-deuteranopia')).toBeVisible();
  await expect(page.getByTestId('cvd-row-tritanopia')).toBeVisible();
  await expect(page.getByTestId('cvd-row-achromatopsia')).toBeVisible();
  // Achromatopsia row renders grey swatches (a title attr with a hex).
  await expect(page.getByTestId('cvd-achromatopsia-0')).toHaveAttribute('title', /^#[0-9a-f]{6}$/);
});

test('Color name finder identifies named colors', async ({ page }) => {
  await page.goto('/color-name');
  await page.getByTestId('cname-hex').fill('#ff0000');
  await expect(page.getByTestId('cname-name')).toHaveText('red');
  await expect(page.getByTestId('cname-detail')).toContainText('Exact match');

  await page.getByTestId('cname-hex').fill('#4682b5'); // near steelblue
  await expect(page.getByTestId('cname-name')).toHaveText('steelblue');
  await expect(page.getByTestId('cname-detail')).toContainText('Nearest');

  await page.getByTestId('cname-hex').fill('nope');
  await expect(page.getByTestId('cname-error')).toBeVisible();
});
