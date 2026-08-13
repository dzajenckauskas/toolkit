import { test, expect } from '@playwright/test';

test('the blog is reachable from the header and lists posts', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('nav-Blog').click();
  await expect(page).toHaveURL(/\/blog$/);

  await expect(page.getByTestId('blog-list')).toBeVisible();
  await expect(page.getByTestId('blog-card-remove-gps-data-from-photos')).toBeVisible();
  await expect(page.getByTestId('blog-card-decode-jwt-safely')).toBeVisible();
  // All nine posts are listed.
  await expect(page.getByTestId('blog-list').locator('a')).toHaveCount(9);
});

test('a post renders with tool CTAs, FAQ, related posts and JSON-LD', async ({ page }) => {
  await page.goto('/blog/remove-gps-data-from-photos');

  await expect(page.getByRole('heading', { name: /GPS Location/i })).toBeVisible();

  // "Try the tool" CTA points at the linked tool, top and bottom.
  const cta = page.getByTestId('blog-cta-top');
  await expect(cta).toHaveAttribute('href', '/metadata-cleaner');
  await expect(page.getByTestId('blog-cta-bottom')).toHaveAttribute('href', '/metadata-cleaner');

  // FAQ content renders in the body (also fed to JSON-LD).
  await expect(page.getByTestId('blog-body')).toContainText('affect photo quality');

  // Cover image renders, and the OG/Twitter image points at it.
  const cover = page.getByTestId('blog-cover');
  await expect(cover).toBeVisible();
  await expect(cover).toHaveAttribute('src', '/blog/covers/remove-gps-data-from-photos.png');
  await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute(
    'content',
    /\/blog\/covers\/remove-gps-data-from-photos\.png$/,
  );

  // Structured-data blocks are present (Article, FAQ, breadcrumb).
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
  expect(ld).toContain('BlogPosting');
  expect(ld).toContain('FAQPage');
  expect(ld).toContain('BreadcrumbList');

  // Related posts from the same category, and the CTA navigates to the tool.
  await expect(page.getByTestId('blog-related')).toBeVisible();
  await cta.click();
  await expect(page).toHaveURL(/\/metadata-cleaner$/);
});

test('an unknown blog slug returns 404', async ({ page }) => {
  const res = await page.goto('/blog/this-post-does-not-exist');
  expect(res?.status()).toBe(404);
});
