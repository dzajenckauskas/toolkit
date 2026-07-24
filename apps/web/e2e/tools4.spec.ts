import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';

const sampleJpeg = resolve(__dirname, 'fixtures/sample.jpg');

test('Checksum verifier hashes a file and compares', async ({ page }) => {
  await page.goto('/checksum');
  await page.getByTestId('checksum-file').setInputFiles(sampleJpeg);

  const digest = page.getByTestId('checksum-digest');
  await expect(digest).not.toHaveText('');
  const value = (await digest.textContent()) ?? '';
  expect(value).toMatch(/^[0-9a-f]{64}$/);

  await page.getByTestId('checksum-expected').fill(value.toUpperCase());
  await expect(page.getByTestId('checksum-result')).toContainText('match');

  await page.getByTestId('checksum-expected').fill('deadbeef');
  await expect(page.getByTestId('checksum-result')).toContainText('do not match');
});

test('Metadata cleaner re-encodes and downloads', async ({ page }) => {
  await page.goto('/metadata-cleaner');
  await page.getByTestId('metadata-file-input').setInputFiles(sampleJpeg);
  await expect(page.getByTestId('metadata-source')).toContainText('900 × 700');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('metadata-download').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/-clean\.png$/);
});

test('Favicon generator produces a ZIP', async ({ page }) => {
  await page.goto('/favicon');
  await page.getByTestId('favicon-file-input').setInputFiles(sampleJpeg);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('favicon-download').click(),
  ]);
  expect(download.suggestedFilename()).toBe('favicons.zip');
});
