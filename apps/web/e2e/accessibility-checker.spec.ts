import { test, expect } from '@playwright/test';

test('starts a server-assisted audit and renders the completed evidence summary', async ({
  page,
}) => {
  await page.route('**/api/accessibility-checker/audits', async (route) => {
    expect(route.request().postDataJSON()).toMatchObject({ url: 'https://example.com' });
    await route.fulfill({
      status: 202,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'audit-1',
        status: 'running',
        logs: [],
        report: null,
        artifacts: [],
        error: null,
      }),
    });
  });
  await page.route('**/api/accessibility-checker/audits/audit-1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'audit-1',
        status: 'complete',
        logs: [],
        artifacts: ['first.svg', 'second.svg'],
        error: null,
        report: {
          url: 'https://example.com/',
          overall: 'no-trap-observed',
          findings: [
            {
              id: 'document-title',
              title: 'Page has a document title',
              assessment: 'confirmed',
              impact: 'serious',
              observed: 'A title was found.',
              whyItMatters: 'It identifies the page.',
              evidence: [],
            },
          ],
          frameworks: [],
          journey: { stages: [] },
        },
      }),
    });
  });
  await page.route('**/artifacts/*.svg', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="10"><rect width="16" height="10" fill="#4f736e"/></svg>',
    });
  });

  await page.goto('/accessibility-checker');
  await expect(
    page.getByRole('heading', { name: 'Accessibility checker', exact: true }),
  ).toBeVisible();
  const input = page.getByPlaceholder('example.com');
  await input.fill('example.com');
  await page.getByRole('button', { name: 'Run accessibility audit' }).click();
  await expect(input).toHaveValue('https://example.com');
  await expect(page.getByRole('heading', { name: 'Accessibility risk overview' })).toBeVisible();
  await expect(page.getByText('Page has a document title')).toBeVisible();
  await expect(page.getByText('Current audit · https://example.com/')).toBeVisible();
  await expect(page.getByText('Replace with JSON')).toBeVisible();

  await page.getByRole('button', { name: 'Open screenshot 1: first.svg' }).click();
  const dialog = page.getByRole('dialog', { name: 'Audit evidence' });
  await expect(dialog).toBeVisible();
  for (const name of ['Close', '← Previous', 'Next →']) {
    const button = dialog.getByRole('button', { name });
    await expect(button).toBeVisible();
    await expect(button).toHaveCSS('color', 'rgb(242, 240, 236)');
  }
});

test('presents regression review as a guided two-report workflow', async ({ page }) => {
  await page.goto('/accessibility-checker');
  await expect(page.getByRole('heading', { name: 'Regression review' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Choose the baseline' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Choose the comparison' })).toBeVisible();
  await expect(page.getByLabel('Choose baseline report')).toHaveAttribute(
    'accept',
    '.json,application/json',
  );
  await expect(page.getByText('No baseline selected')).toBeVisible();
  await expect(page.getByText('No comparison selected')).toBeVisible();
});

test('shows runner validation errors without losing the submitted URL', async ({ page }) => {
  await page.route('**/api/accessibility-checker/audits', async (route) => {
    await route.fulfill({
      status: 422,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Local and private network websites cannot be tested.' }),
    });
  });
  await page.goto('/accessibility-checker');
  const input = page.getByPlaceholder('example.com');
  await input.fill('http://127.0.0.1');
  await page.getByRole('button', { name: 'Run accessibility audit' }).click();
  await expect(page.locator('p[role="alert"]')).toContainText(
    'Local and private network websites cannot be tested',
  );
  await expect(input).toHaveValue('http://127.0.0.1');
});
