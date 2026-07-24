import { test, expect } from '@playwright/test';

test('QR generator renders a code and offers a PNG download', async ({ page }) => {
  await page.goto('/qr');
  await page.getByTestId('qr-input').fill('https://example.com');
  const image = page.getByTestId('qr-image');
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute('src', /^data:image\/png;base64,/);
  await expect(page.getByTestId('qr-download')).toHaveAttribute('download', 'qr-code.png');
});

test('Markdown editor renders a live preview and is XSS-safe', async ({ page }) => {
  await page.goto('/markdown');
  await page
    .getByTestId('md-input')
    .fill('# Heading\n\n**bold** and a [link](https://example.com)');
  const preview = page.getByTestId('md-preview');
  await expect(preview.locator('h1')).toHaveText('Heading');
  await expect(preview.locator('strong')).toHaveText('bold');

  await page.getByTestId('md-input').fill('<script>window.__pwned = true</script>');
  await expect(preview.locator('script')).toHaveCount(0);
  expect(
    await page.evaluate(() => (window as unknown as { __pwned?: boolean }).__pwned),
  ).toBeUndefined();
});
