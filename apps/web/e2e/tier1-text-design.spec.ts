import { test, expect } from '@playwright/test';

test('Word counter counts words and characters', async ({ page }) => {
  await page.goto('/word-count');
  await page.getByTestId('wc-input').fill('Hello world. How are you?');
  await expect(page.getByTestId('wc-words')).toHaveText('5');
  await expect(page.getByTestId('wc-sentences')).toHaveText('2');
  await expect(page.getByTestId('wc-characters')).toHaveText('25');
});

test('Slugify produces a URL slug and strips accents', async ({ page }) => {
  await page.goto('/slugify');
  await page.getByTestId('slug-input').fill('Crème Brûlée & Friends!');
  await expect(page.getByTestId('slug-output')).toHaveValue('creme-brulee-friends');

  await page.getByTestId('slug-underscore').check();
  await expect(page.getByTestId('slug-output')).toHaveValue('creme_brulee_friends');
});

test('Contrast checker evaluates WCAG levels', async ({ page }) => {
  await page.goto('/contrast');
  await page.getByTestId('contrast-fg').fill('#000000');
  await page.getByTestId('contrast-bg').fill('#ffffff');
  await expect(page.getByTestId('contrast-ratio')).toContainText('21:1');
  await expect(page.getByTestId('contrast-aaa-normal')).toContainText('✓');

  await page.getByTestId('contrast-fg').fill('#777777');
  await page.getByTestId('contrast-bg').fill('#888888');
  await expect(page.getByTestId('contrast-aa-normal')).toContainText('✗');
});
