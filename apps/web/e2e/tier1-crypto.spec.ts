import { test, expect } from '@playwright/test';

test('Text encryptor round-trips with a password', async ({ page }) => {
  await page.goto('/encrypt');
  await page.getByTestId('encrypt-input').fill('meet me at noon');
  await page.getByTestId('encrypt-password').fill('s3cret');
  await page.getByTestId('encrypt-run').click();

  const token = await page.getByTestId('encrypt-output').inputValue();
  expect(token).not.toContain('noon');
  expect(token.length).toBeGreaterThan(20);

  // Decrypt it back.
  await page.getByTestId('encrypt-mode-decrypt').click();
  await page.getByTestId('encrypt-input').fill(token);
  await page.getByTestId('encrypt-password').fill('s3cret');
  await page.getByTestId('encrypt-run').click();
  await expect(page.getByTestId('encrypt-output')).toHaveValue('meet me at noon');
});

test('Text encryptor reports a wrong password', async ({ page }) => {
  await page.goto('/encrypt');
  await page.getByTestId('encrypt-input').fill('classified');
  await page.getByTestId('encrypt-password').fill('right');
  await page.getByTestId('encrypt-run').click();
  const token = await page.getByTestId('encrypt-output').inputValue();

  await page.getByTestId('encrypt-mode-decrypt').click();
  await page.getByTestId('encrypt-input').fill(token);
  await page.getByTestId('encrypt-password').fill('wrong');
  await page.getByTestId('encrypt-run').click();
  await expect(page.getByTestId('encrypt-error')).toBeVisible();
});

test('TOTP generator produces a 6-digit code', async ({ page }) => {
  await page.goto('/totp');
  await page.getByTestId('totp-secret').fill('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ');
  await expect(page.getByTestId('totp-code')).toBeVisible();
  const code = ((await page.getByTestId('totp-code').textContent()) ?? '').replace(/\s/g, '');
  expect(code).toMatch(/^\d{6}$/);
  await expect(page.getByTestId('totp-remaining')).toContainText('Refreshes in');

  await page.getByTestId('totp-secret').fill('!!! not base32 !!!');
  await expect(page.getByTestId('totp-error')).toBeVisible();
});

test('HMAC generator matches the known SHA-256 vector', async ({ page }) => {
  await page.goto('/hmac');
  await page.getByTestId('hmac-message').fill('The quick brown fox jumps over the lazy dog');
  await page.getByTestId('hmac-key').fill('key');
  await expect(page.getByTestId('hmac-output')).toHaveText(
    'f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8',
  );
});
