import { test, expect } from '@playwright/test';

test('home catalog lists tools, searches, and links live ones', async ({ page }) => {
  await page.goto('/');

  // Live tools link; planned tools are shown but not links.
  await expect(page.getByTestId('tool-optimize')).toBeVisible();
  await expect(page.getByTestId('tool-uuid')).toBeVisible();

  const search = page.getByTestId('tool-search');
  await search.fill('uuid');
  await expect(page.getByTestId('tool-uuid')).toBeVisible();
  await expect(page.getByTestId('tool-optimize')).toHaveCount(0); // filtered out

  await page.getByTestId('tool-uuid').click();
  await expect(page).toHaveURL(/\/uuid$/);
});

test('search with no matches shows the empty state', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('tool-search').fill('zzzznotarealtool');
  await expect(page.getByTestId('tool-empty')).toBeVisible();
});

test('UUID generator produces the requested number of v4 UUIDs', async ({ page }) => {
  await page.goto('/uuid');

  const output = page.getByTestId('uuid-output');
  await expect(output).not.toHaveValue('');
  // Default batch is 5.
  expect((await output.inputValue()).trim().split('\n')).toHaveLength(5);

  await page.getByTestId('uuid-count').fill('3');
  await page.getByTestId('uuid-generate').click();
  const lines = (await output.inputValue()).trim().split('\n');
  expect(lines).toHaveLength(3);
  // Each line looks like a v4 UUID.
  for (const line of lines) {
    expect(line).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  }
});
