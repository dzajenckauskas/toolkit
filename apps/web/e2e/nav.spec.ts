import { test, expect } from '@playwright/test';

test('the header navigates between tools and marks the active one', async ({ page }) => {
  await page.goto('/optimize');

  const optimize = page.getByTestId('nav-optimize');
  const crop = page.getByTestId('nav-crop');
  await expect(optimize).toBeVisible();
  await expect(crop).toBeVisible();

  // Active tool is marked for assistive tech.
  await expect(optimize).toHaveAttribute('aria-current', 'page');
  await expect(crop).not.toHaveAttribute('aria-current', 'page');

  await crop.click();
  await expect(page).toHaveURL(/\/crop$/);
  await expect(page.getByTestId('crop-dropzone')).toBeVisible();
  await expect(page.getByTestId('nav-crop')).toHaveAttribute('aria-current', 'page');

  // Brand link returns home.
  await page.getByRole('link', { name: 'Ecommerce Toolkit' }).click();
  await expect(page).toHaveURL(/\/$/);
});
