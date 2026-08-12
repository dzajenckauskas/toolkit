import { test, expect } from '@playwright/test';
import { TOOLS, toolBadge } from '@toolkit/tools/registry';

test('catalog cards show Soon / New / Top badges', async ({ page }) => {
  await page.goto('/');

  // Top: a curated flagship (no launch date, so it is always "Top").
  const topCard = page.getByTestId('tool-image-editor');
  await expect(topCard.getByTestId('badge-top')).toBeVisible();

  // Soon: the first planned tool in the registry.
  const planned = TOOLS.find((t) => t.status === 'planned');
  expect(planned).toBeTruthy();
  await expect(page.getByTestId(`tool-${planned!.id}`).getByTestId('badge-soon')).toBeVisible();

  // New: computed from the registry with the same clock as the app, so this
  // stays honest as launch windows expire (asserted only while one is new).
  const fresh = TOOLS.find((t) => toolBadge(t) === 'new');
  if (fresh) {
    await expect(page.getByTestId(`tool-${fresh.id}`).getByTestId('badge-new')).toBeVisible();
  }
});

test('home catalog search text clears the search icon', async ({ page }) => {
  await page.goto('/');

  const search = page.getByTestId('tool-search');
  const paddingLeft = await search.evaluate((input) =>
    Number.parseFloat(window.getComputedStyle(input).paddingLeft),
  );

  // The 18px icon begins 16px from the input edge; leave space beyond it.
  expect(paddingLeft).toBeGreaterThanOrEqual(40);
});

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

test('search matches action keywords, not just names', async ({ page }) => {
  await page.goto('/');
  // "encode" is a keyword of Base64, not part of its name/description.
  await page.getByTestId('tool-search').fill('encode');
  await expect(page.getByTestId('tool-base64')).toBeVisible();
});

test('command palette navigates with the keyboard', async ({ page }) => {
  await page.goto('/');
  const search = page.getByTestId('tool-search');
  // "json" matches the JSON tool first, then the JWT tool (mentions JSON).
  await search.fill('json');
  await expect(page.getByTestId('tool-json')).toBeVisible();
  await search.press('ArrowDown'); // move to the second result (JWT)
  await search.press('Enter');
  await expect(page).toHaveURL(/\/jwt$/);
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
