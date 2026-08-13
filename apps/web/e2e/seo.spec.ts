import { test, expect } from '@playwright/test';

/** Join every JSON-LD block on a page into one searchable string. */
async function jsonLd(page: import('@playwright/test').Page): Promise<string> {
  return (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
}

test('a tool page emits SoftwareApplication, breadcrumb and FAQ structured data', async ({
  page,
}) => {
  await page.goto('/json');

  const ld = await jsonLd(page);
  expect(ld).toContain('SoftwareApplication');
  expect(ld).toContain('BreadcrumbList');
  // The JSON tool has authored FAQs, so the FAQPage block is emitted too.
  expect(ld).toContain('FAQPage');

  // The default social card is inherited by tool pages.
  await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute(
    'content',
    /\/og-default\.png$/,
  );

  // The authored walkthrough and FAQ actually render on the page.
  await expect(page.getByTestId('tool-steps')).toBeVisible();
  await expect(page.getByTestId('tool-faqs')).toBeVisible();
});

test('a tool without authored FAQs omits the FAQPage block', async ({ page }) => {
  // text-diff has an authored walkthrough but no FAQs.
  await page.goto('/text-diff');

  const ld = await jsonLd(page);
  expect(ld).toContain('SoftwareApplication');
  expect(ld).toContain('BreadcrumbList');
  expect(ld).not.toContain('FAQPage');
});

test('the homepage emits WebSite and Organization structured data', async ({ page }) => {
  await page.goto('/');

  const ld = await jsonLd(page);
  expect(ld).toContain('WebSite');
  expect(ld).toContain('Organization');

  await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute(
    'content',
    /\/og-default\.png$/,
  );
});

test('the FAQ page emits FAQPage structured data', async ({ page }) => {
  await page.goto('/faq');

  const ld = await jsonLd(page);
  expect(ld).toContain('FAQPage');
  expect(ld).toContain('Is Toolkit really free');
});
