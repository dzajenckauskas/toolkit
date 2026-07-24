import { test, expect } from '@playwright/test';

test('Text diff highlights added and removed lines', async ({ page }) => {
  await page.goto('/text-diff');
  await page.getByTestId('diff-before').fill('a\nb\nc');
  await page.getByTestId('diff-after').fill('a\nc\nd');
  await expect(page.getByTestId('diff-stats')).toContainText('1 added');
  await expect(page.getByTestId('diff-stats')).toContainText('1 removed');
  await expect(page.getByTestId('diff-result')).toBeVisible();
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
