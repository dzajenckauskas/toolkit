import { test, expect } from '@playwright/test';
import { LIVE_TOOLS } from '@toolkit/tools/registry';

test('live tool pages keep native controls inside the narrow viewport', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 320, height: 800 });

  for (const tool of LIVE_TOOLS) {
    await page.goto(tool.href);

    const overflow = await page.evaluate(() => {
      const viewportWidth = document.documentElement.clientWidth;
      const controls = [...document.querySelectorAll<HTMLElement>('input, select, textarea')];
      const outside = controls
        .filter((control) => {
          const rect = control.getBoundingClientRect();
          return rect.width > 0 && (rect.left < -0.5 || rect.right > viewportWidth + 0.5);
        })
        .map((control) => control.getAttribute('data-testid') ?? control.outerHTML.slice(0, 80));

      return {
        documentOverflow: document.documentElement.scrollWidth - viewportWidth,
        controls: outside,
      };
    });

    expect(overflow, `${tool.href} should not overflow at 320px`).toEqual({
      documentOverflow: 0,
      controls: [],
    });
  }
});

test('number steppers inherit the active theme', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('toolkit:theme', 'dark'));
  await page.goto('/percentage');

  const colorScheme = await page
    .getByTestId('pct-a')
    .evaluate((input) => window.getComputedStyle(input).colorScheme);

  expect(colorScheme).toBe('dark');
});
