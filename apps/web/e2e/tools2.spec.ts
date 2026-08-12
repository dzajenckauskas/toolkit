import { test, expect } from '@playwright/test';

test('Hash generator computes SHA digests', async ({ page }) => {
  await page.goto('/hash');
  await page.getByTestId('hash-input').fill('abc');
  await expect(page.getByTestId('hash-sha-256')).toHaveText(
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  );
  await expect(page.getByTestId('hash-sha-1')).toHaveText(
    'a9993e364706816aba3e25717850c26c9cd0d89d',
  );
});

test('JWT decoder shows header and payload', async ({ page }) => {
  await page.goto('/jwt');
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
    '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
    '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  await page.getByTestId('jwt-input').fill(token);
  await expect(page.getByTestId('jwt-header')).toContainText('HS256');
  await expect(page.getByTestId('jwt-payload')).toContainText('John Doe');

  await page.getByTestId('jwt-input').fill('not.a.jwt');
  await expect(page.getByTestId('jwt-error')).toBeVisible();
});

test('JWT generator signs a token, downloads it, and round-trips with the decoder', async ({
  page,
}) => {
  await page.goto('/jwt');
  await page.getByTestId('jwt-mode-generate').click();

  // The generator defaults match the canonical jwt.io HS256 example, so the
  // signed output is a known value — proves the whole sign path end to end.
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
    '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
    '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  await expect(page.getByTestId('jwt-gen-token')).toHaveValue(token);

  // Download the token.
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('jwt-gen-download').click(),
  ]);
  expect(download.suggestedFilename()).toBe('token.jwt');

  // Invalid header JSON surfaces an error and clears the token.
  await page.getByTestId('jwt-gen-header').fill('{ not json');
  await expect(page.getByTestId('jwt-gen-error')).toBeVisible();
  await expect(page.getByTestId('jwt-gen-token')).toHaveValue('');

  // Round-trip: the generated token decodes back to the same header/payload.
  await page.getByTestId('jwt-mode-decode').click();
  await page.getByTestId('jwt-input').fill(token);
  await expect(page.getByTestId('jwt-header')).toContainText('HS256');
  await expect(page.getByTestId('jwt-payload')).toContainText('John Doe');
});

test('Regex tester finds matches and flags errors', async ({ page }) => {
  await page.goto('/regex');
  await page.getByTestId('regex-pattern').fill('\\d+');
  await page.getByTestId('regex-text').fill('a1 b22 c333');
  await expect(page.getByTestId('regex-results')).toContainText('3 matches');

  await page.getByTestId('regex-pattern').fill('(');
  await expect(page.getByTestId('regex-error')).toBeVisible();
});

test('Color converter converts HEX to RGB and HSL', async ({ page }) => {
  await page.goto('/colors');
  await page.getByTestId('color-hex').fill('#ff0000');
  await expect(page.getByTestId('color-out-rgb')).toHaveText('rgb(255, 0, 0)');
  await expect(page.getByTestId('color-out-hsl')).toHaveText('hsl(0, 100%, 50%)');

  await page.getByTestId('color-hex').fill('nothex');
  await expect(page.getByTestId('color-error')).toBeVisible();
});
