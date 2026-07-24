import { test, expect } from '@playwright/test';

test('Unit converter converts length and temperature', async ({ page }) => {
  await page.goto('/unit-converter');
  await page.getByTestId('unit-value').fill('1');
  await page.getByTestId('unit-from').selectOption('km');
  await page.getByTestId('unit-to').selectOption('m');
  await expect(page.getByTestId('unit-output')).toHaveValue('1000');

  await page.getByTestId('unit-category').selectOption('temperature');
  await page.getByTestId('unit-value').fill('100');
  await page.getByTestId('unit-from').selectOption('C');
  await page.getByTestId('unit-to').selectOption('F');
  await expect(page.getByTestId('unit-output')).toHaveValue('212');
});

test('Percentage calculator computes values', async ({ page }) => {
  await page.goto('/percentage');
  await page.getByTestId('pct-a').fill('15');
  await page.getByTestId('pct-b').fill('200');
  await expect(page.getByTestId('pct-of-result')).toContainText('30');

  await page.getByTestId('tip-bill').fill('100');
  await page.getByTestId('tip-pct').fill('20');
  await page.getByTestId('tip-people').fill('4');
  await expect(page.getByTestId('tip-result')).toContainText('30 each');
});

test('Timestamp converter shows ISO for an epoch', async ({ page }) => {
  await page.goto('/timestamp');
  await page.getByTestId('ts-epoch-input').fill('1700000000');
  await expect(page.getByTestId('ts-iso')).toHaveText('2023-11-14T22:13:20.000Z');

  await page.getByTestId('ts-date-input').fill('1970-01-01T00:00:00Z');
  await expect(page.getByTestId('ts-date-seconds')).toHaveText('0');
});

test('CSV/JSON converter converts both directions', async ({ page }) => {
  await page.goto('/csv-json');
  await page.getByTestId('csv-input').fill('id,name\n1,Alice\n2,Bob');
  await expect(page.getByTestId('csv-output')).toContainText('"name": "Alice"');

  await page.getByTestId('csv-mode-json2csv').click();
  await page.getByTestId('csv-input').fill('[{"a":1,"b":2}]');
  await expect(page.getByTestId('csv-output')).toHaveValue('a,b\n1,2');

  await page.getByTestId('csv-input').fill('{ not json }');
  await expect(page.getByTestId('csv-error')).toBeVisible();
});
