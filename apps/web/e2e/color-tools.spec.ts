import { test, expect } from '@playwright/test';

test('Palette generator shows harmonies for a base color', async ({ page }) => {
  await page.goto('/palette');
  await page.getByTestId('palette-hex').fill('#ff0000');
  await expect(page.getByTestId('palette-complementary')).toBeVisible();
  await expect(page.getByTestId('palette-triadic')).toBeVisible();
  // Complementary strip has two swatches.
  await expect(page.getByTestId('palette-complementary').locator('button')).toHaveCount(2);

  await page.getByTestId('palette-hex').fill('notacolor');
  await expect(page.getByTestId('palette-error')).toBeVisible();
});

test('Gradient generator builds CSS', async ({ page }) => {
  await page.goto('/gradient');
  await expect(page.getByTestId('gradient-css')).toContainText('linear-gradient(');
  await page.getByTestId('gradient-type').selectOption('radial');
  await expect(page.getByTestId('gradient-css')).toContainText('radial-gradient(');
});

test('Color mixer blends two colors', async ({ page }) => {
  await page.goto('/color-mixer');
  await expect(page.getByTestId('mix-strip').locator('button')).toHaveCount(7);
  await page.getByTestId('mix-steps').fill('5');
  await expect(page.getByTestId('mix-strip').locator('button')).toHaveCount(5);
  await expect(page.getByTestId('mix-middle')).toContainText('#');
});

test('Blob generator renders a path and changes on randomize', async ({ page }) => {
  await page.goto('/blob');
  const path = page.getByTestId('blob-path');
  const before = await path.getAttribute('d');
  expect(before).toMatch(/^M /);
  await page.getByTestId('blob-randomize').click();
  await expect(path).not.toHaveAttribute('d', before ?? '');
  await expect(page.getByTestId('blob-download')).toHaveAttribute('download', 'blob.svg');
});

test('Theme maker previews and exports CSS variables', async ({ page }) => {
  await page.goto('/theme-maker');
  await page.getByTestId('theme-accent').fill('#22aa66');
  await expect(page.getByTestId('theme-light')).toBeVisible();
  await expect(page.getByTestId('theme-dark')).toBeVisible();
  await expect(page.getByTestId('theme-css')).toContainText('--accent: #22aa66;');
  await expect(page.getByTestId('theme-css')).toContainText('prefers-color-scheme: dark');
});
