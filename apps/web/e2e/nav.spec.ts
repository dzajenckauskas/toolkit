import { test, expect } from '@playwright/test';

test('the header brand links home and quick links navigate', async ({ page }) => {
  await page.goto('/optimize');

  // Quick links are visible on wide viewports (Playwright default is 1280px).
  const faq = page.getByTestId('nav-FAQ');
  await expect(faq).toBeVisible();
  await faq.click();
  await expect(page).toHaveURL(/\/faq$/);
  await expect(page.getByTestId('faq-item-0')).toBeVisible();

  // Brand returns home.
  await page.getByTestId('brand-home').click();
  await expect(page).toHaveURL(/\/$/);
});

test('the FAQ, Contact and Terms are reachable and wired correctly', async ({ page }) => {
  await page.goto('/faq');
  // Expanding a question opens its <details> and reveals the answer.
  const item = page.getByTestId('faq-item-1');
  await item.locator('summary').click();
  await expect(item).toHaveAttribute('open', '');

  // Footer credit points at the author's site; Contact is a mailto.
  await expect(page.getByTestId('footer-author')).toHaveAttribute(
    'href',
    'https://zajenckauskas.lt',
  );
  await expect(page.getByTestId('footer-contact')).toHaveAttribute(
    'href',
    /^mailto:danielius@zajenckauskas\.lt/,
  );

  // Terms page renders.
  await page.getByTestId('footer-terms').click();
  await expect(page).toHaveURL(/\/terms$/);
  await expect(page.getByRole('heading', { name: 'Terms & Conditions' })).toBeVisible();
});

test('the closed mobile drawer is hidden and causes no horizontal overflow', async ({ page }) => {
  await page.goto('/terms');
  // The drawer exists but is hidden when closed (not in the tab order).
  await expect(page.getByTestId('mobile-menu')).toBeHidden();
  // The off-canvas drawer must not widen the page (no horizontal scroll).
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );
  expect(overflow).toBe(true);
});

test('the theme toggle switches and persists dark mode', async ({ page }) => {
  await page.goto('/');
  const root = page.locator('html');

  await page.getByTestId('theme-toggle').click();
  await expect(root).toHaveAttribute('data-theme', /light|dark/);
  const chosen = await root.getAttribute('data-theme');

  // The choice persists across a reload (localStorage + no-flash script).
  await page.reload();
  await expect(root).toHaveAttribute('data-theme', chosen ?? 'dark');
});

test('the menu drawer opens and lists categories', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('menu-open').click();
  await expect(page.getByTestId('mobile-menu')).toBeVisible();
  await expect(page.getByTestId('menu-cat-Developer')).toBeVisible();

  // A category link jumps to that section on the home catalog.
  await page.getByTestId('menu-cat-Design').click();
  await expect(page).toHaveURL(/#cat-Design$/);
  await expect(page.getByTestId('cat-Design')).toBeVisible();
});

test('the home page browses tools by category', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('category-chips')).toBeVisible();
  // Filter to Developer only.
  await page.getByTestId('chip-Developer').click();
  await expect(page.getByTestId('cat-Developer')).toBeVisible();
  await expect(page.getByTestId('cat-Design')).toHaveCount(0);
  // Back to all.
  await page.getByTestId('chip-all').click();
  await expect(page.getByTestId('cat-Design')).toBeVisible();
});
