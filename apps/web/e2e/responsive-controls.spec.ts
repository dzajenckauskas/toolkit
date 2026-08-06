import { test, expect } from '@playwright/test';
import { LIVE_TOOLS } from '@toolkit/tools/registry';

test('live tool pages keep native controls inside the narrow viewport', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 320, height: 800 });

  for (const tool of LIVE_TOOLS) {
    await page.goto(tool.href);

    const overflow = await page.evaluate(() => {
      // window.innerWidth is the real viewport size, used to judge whether a
      // control actually renders past the visible edge.
      const viewportWidth = window.innerWidth;
      const controls = [...document.querySelectorAll<HTMLElement>('input, select, textarea')];
      const outside = controls
        .filter((control) => {
          const rect = control.getBoundingClientRect();
          return rect.width > 0 && (rect.left < -0.5 || rect.right > viewportWidth + 0.5);
        })
        .map((control) => control.getAttribute('data-testid') ?? control.outerHTML.slice(0, 80));

      // `scrollbar-gutter: stable` (see GlobalStyles) permanently reserves a
      // scrollbar-width strip on platforms with non-overlay scrollbars (e.g.
      // CI's Linux runner), even on pages with no vertical overflow. That
      // makes scrollWidth legitimately *narrower* than window.innerWidth —
      // harmless, so only a positive gap (real horizontal overflow) counts.
      return {
        documentOverflow: Math.max(0, document.documentElement.scrollWidth - viewportWidth),
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
