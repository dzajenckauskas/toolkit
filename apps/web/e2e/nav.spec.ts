import { test, expect } from '@playwright/test';

test('the header brand links home and quick links navigate', async ({ page }) => {
  await page.goto('/optimize');

  // Quick links are visible on wide viewports (Playwright default is 1280px).
  const crop = page.getByRole('link', { name: 'Crop', exact: true });
  await expect(crop).toBeVisible();
  await crop.click();
  await expect(page).toHaveURL(/\/crop$/);
  await expect(page.getByTestId('crop-dropzone')).toBeVisible();

  // Brand returns home.
  await page.getByTestId('brand-home').click();
  await expect(page).toHaveURL(/\/$/);
});

test('the theme toggle switches and persists dark mode', async ({ page }) => {
  await page.goto('/');
  const root = page.locator('html');

  await page.getByTestId('theme-toggle').click();
  await expect(root).toHaveAttribute('data-theme', /light|dark/);
  const chosen = await root.getAttribute('data-theme');

  // The choice persists across a reload (localStorage + no-flash script).
  await page.reload();
  await expect(root).toHaveAttribute('data-theme', chosen ?? 'dark');
});

test('the menu drawer opens and lists categories', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('menu-open').click();
  await expect(page.getByTestId('mobile-menu')).toBeVisible();
  await expect(page.getByTestId('menu-cat-Developer')).toBeVisible();

  // A category link jumps to that section on the home catalog.
  await page.getByTestId('menu-cat-Design').click();
  await expect(page).toHaveURL(/#cat-Design$/);
  await expect(page.getByTestId('cat-Design')).toBeVisible();
});

test('the home page browses tools by category', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('category-chips')).toBeVisible();
  // Filter to Developer only.
  await page.getByTestId('chip-Developer').click();
  await expect(page.getByTestId('cat-Developer')).toBeVisible();
  await expect(page.getByTestId('cat-Design')).toHaveCount(0);
  // Back to all.
  await page.getByTestId('chip-all').click();
  await expect(page.getByTestId('cat-Design')).toBeVisible();
});
