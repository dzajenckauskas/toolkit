import { test, expect } from '@playwright/test';

test('tool pages render only deliberately authored guidance', async ({ page }) => {
  await page.goto('/uuid');
  await expect(page.getByTestId('tool-steps')).toHaveCount(0);
  await expect(page.getByTestId('tool-highlights')).toHaveCount(0);
  await expect(page.getByTestId('tool-faqs')).toHaveCount(0);

  await page.goto('/text-diff');
  await expect(page.getByTestId('tool-steps')).toBeVisible();
  await expect(page.getByTestId('tool-highlights')).toHaveCount(0);
  await expect(page.getByTestId('tool-faqs')).toHaveCount(0);

  await page.goto('/optimize');
  await expect(page.getByTestId('tool-steps')).toBeVisible();
  await expect(page.getByTestId('tool-highlights')).toBeVisible();
  await expect(page.getByTestId('tool-faqs')).toBeVisible();
});

test('related tools band stays attached to the footer on short tool pages', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/screenshot');

  const band = await page.getByTestId('related-tools-band').boundingBox();
  const footer = await page.locator('footer').boundingBox();

  expect(band).not.toBeNull();
  expect(footer).not.toBeNull();
  expect(Math.abs(band!.y + band!.height - footer!.y)).toBeLessThanOrEqual(1);
});

test('Text diff highlights added and removed lines', async ({ page }) => {
  await page.goto('/text-diff');
  await page.getByTestId('diff-before').fill('a\nb\nc');
  await page.getByTestId('diff-after').fill('a\nc\nd');
  await expect(page.getByTestId('diff-stats')).toContainText('1 added');
  await expect(page.getByTestId('diff-stats')).toContainText('1 removed');
  await expect(page.getByTestId('diff-result')).toBeVisible();
});

test('Text diff switches to an aligned side-by-side view and swaps sides', async ({ page }) => {
  await page.goto('/text-diff');
  const before = page.getByTestId('diff-before');
  const after = page.getByTestId('diff-after');
  await before.fill('same\nold one\nold two\nend');
  await after.fill('same\nnew one\nend');

  await page.getByTestId('diff-view-side').click();
  await expect(page.getByTestId('diff-side-result')).toBeVisible();
  await expect(page.getByTestId('diff-side-row')).toHaveCount(4);
  await expect(page.getByTestId('diff-side-result')).toContainText('old one');
  await expect(page.getByTestId('diff-side-result')).toContainText('new one');

  await page.getByTestId('diff-swap').click();
  await expect(before).toHaveValue('same\nnew one\nend');
  await expect(after).toHaveValue('same\nold one\nold two\nend');
  await expect(page.getByTestId('diff-stats')).toContainText('2 added');
  await expect(page.getByTestId('diff-stats')).toContainText('1 removed');
});

test('Text diff side-by-side view remains within a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/text-diff');
  await page.getByTestId('diff-before').fill('a very long original line that must wrap safely');
  await page.getByTestId('diff-after').fill('a very long changed line that must wrap safely');
  await page.getByTestId('diff-view-side').click();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});

test('Text diff uses the compact radius scale for inputs and swap control', async ({ page }) => {
  await page.goto('/text-diff');

  const radii = await page.evaluate(() => {
    const root = window.getComputedStyle(document.documentElement);
    const before = document.querySelector<HTMLElement>('[data-testid="diff-before"]')!;
    const swap = document.querySelector<HTMLElement>('[data-testid="diff-swap"]')!;
    return {
      tokens: ['--radius-sm', '--radius-md', '--radius-lg', '--radius-xl', '--radius-pill'].map(
        (token) => root.getPropertyValue(token).trim(),
      ),
      input: window.getComputedStyle(before).borderRadius,
      swap: window.getComputedStyle(swap).borderRadius,
      swapSize: [swap.getBoundingClientRect().width, swap.getBoundingClientRect().height],
    };
  });

  expect(radii).toEqual({
    tokens: ['0.375rem', '0.5rem', '0.75rem', '1rem', '999px'],
    input: '8px',
    swap: '50%',
    swapSize: [36, 36],
  });
});

test('Notepad calculator evaluates each line', async ({ page }) => {
  await page.goto('/calculator');
  await page.getByTestId('calc-input').fill('2 + 3\n10 * -2\nbad');
  const results = page.getByTestId('calc-results');
  await expect(results).toContainText('5');
  await expect(results).toContainText('-20');
  await expect(results).toContainText('error');
  await expect(page.getByTestId('calc-total')).toContainText('-15');
});

test('Focus timer starts, pauses, and switches phase', async ({ page }) => {
  await page.goto('/focus-timer');
  await expect(page.getByTestId('timer-phase')).toHaveText('focus');
  await expect(page.getByTestId('timer-clock')).toHaveText('25:00');

  await page.getByTestId('timer-toggle').click();
  await expect(page.getByTestId('timer-toggle')).toHaveText('Pause');
  await expect(page.getByTestId('timer-clock')).not.toHaveText('25:00', { timeout: 3000 });

  await page.getByTestId('timer-break').click();
  await expect(page.getByTestId('timer-phase')).toHaveText('break');
  await expect(page.getByTestId('timer-clock')).toHaveText('5:00');
});
