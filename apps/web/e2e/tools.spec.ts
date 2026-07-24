import { test, expect } from '@playwright/test';

test('Base64 encodes and decodes', async ({ page }) => {
  await page.goto('/base64');
  await page.getByTestId('base64-input').fill('foobar');
  await expect(page.getByTestId('base64-output')).toHaveValue('Zm9vYmFy');

  await page.getByTestId('base64-mode-decode').click();
  await page.getByTestId('base64-input').fill('Zm9vYmFy');
  await expect(page.getByTestId('base64-output')).toHaveValue('foobar');

  await page.getByTestId('base64-input').fill('!!! not base64 !!!');
  await expect(page.getByTestId('base64-error')).toBeVisible();
});

test('Password generator honors length and character sets', async ({ page }) => {
  await page.goto('/password');
  await expect(page.getByTestId('password-output')).not.toHaveValue('');

  // Digits only, then read back the produced value.
  for (const key of ['lowercase', 'uppercase', 'symbols']) {
    const box = page.getByTestId(`password-${key}`);
    if (await box.isChecked()) await box.uncheck();
  }
  await page.getByTestId('password-regenerate').click();
  expect(await page.getByTestId('password-output').inputValue()).toMatch(/^[0-9]+$/);

  // Disabling every set surfaces the guard message.
  await page.getByTestId('password-digits').uncheck();
  await expect(page.getByTestId('password-empty')).toBeVisible();
});

test('Lorem Ipsum generates the requested paragraph count', async ({ page }) => {
  await page.goto('/lorem-ipsum');
  await page.getByTestId('lorem-count').fill('2');
  await page.getByTestId('lorem-generate').click();
  const text = await page.getByTestId('lorem-output').inputValue();
  expect(text.trim().split('\n\n')).toHaveLength(2);
  expect(text).toMatch(/^Lorem ipsum dolor sit amet/);
});

test('JSON formatter formats and reports errors', async ({ page }) => {
  await page.goto('/json');
  await page.getByTestId('json-input').fill('{"a":1,"b":2}');
  await expect(page.getByTestId('json-output')).toHaveValue('{\n  "a": 1,\n  "b": 2\n}');

  await page.getByTestId('json-minify').click();
  await expect(page.getByTestId('json-output')).toHaveValue('{"a":1,"b":2}');

  await page.getByTestId('json-input').fill('{ not json }');
  await expect(page.getByTestId('json-error')).toBeVisible();
});
