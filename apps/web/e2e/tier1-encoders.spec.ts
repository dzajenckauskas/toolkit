import { test, expect } from '@playwright/test';

test('URL encoder encodes, decodes, and flags bad input', async ({ page }) => {
  await page.goto('/url-encode');
  await page.getByTestId('url-input').fill('a b&c');
  await expect(page.getByTestId('url-output')).toHaveValue('a%20b%26c');

  await page.getByTestId('url-mode-decode').click();
  await page.getByTestId('url-input').fill('a%20b%26c');
  await expect(page.getByTestId('url-output')).toHaveValue('a b&c');

  await page.getByTestId('url-input').fill('%');
  await expect(page.getByTestId('url-error')).toBeVisible();
});

test('HTML entities escape and unescape', async ({ page }) => {
  await page.goto('/html-entities');
  await page.getByTestId('html-input').fill('<a>&');
  await expect(page.getByTestId('html-output')).toHaveValue('&lt;a&gt;&amp;');

  await page.getByTestId('html-mode-decode').click();
  await page.getByTestId('html-input').fill('&copy; &mdash; A');
  await expect(page.getByTestId('html-output')).toHaveValue('© — A');
});

test('Number base converter shows all bases and errors', async ({ page }) => {
  await page.goto('/number-base');
  await page.getByTestId('base-input').fill('255');
  await expect(page.getByTestId('base-out-16')).toHaveText('ff');
  await expect(page.getByTestId('base-out-2')).toHaveText('11111111');

  await page.getByTestId('base-from').selectOption('2');
  await page.getByTestId('base-input').fill('2'); // 2 is not a binary digit
  await expect(page.getByTestId('base-error')).toBeVisible();
});

test('Case converter transforms text in place', async ({ page }) => {
  await page.goto('/case-converter');
  await page.getByTestId('case-input').fill('Hello World');
  await page.getByTestId('case-snake').click();
  await expect(page.getByTestId('case-input')).toHaveValue('hello_world');
  await page.getByTestId('case-constant').click();
  await expect(page.getByTestId('case-input')).toHaveValue('HELLO_WORLD');
});

test('Line tools sort and de-duplicate', async ({ page }) => {
  await page.goto('/line-tools');
  await page.getByTestId('line-input').fill('banana\napple\napple');
  await page.getByTestId('line-sort-asc').click();
  await expect(page.getByTestId('line-input')).toHaveValue('apple\napple\nbanana');
  await page.getByTestId('line-dedupe').click();
  await expect(page.getByTestId('line-input')).toHaveValue('apple\nbanana');
  await expect(page.getByTestId('line-stats')).toContainText('2 lines');
});
