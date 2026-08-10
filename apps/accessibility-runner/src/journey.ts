import type { Page } from 'playwright';
import type { Finding } from './findings.js';

export type JourneyStage = {
  id: string;
  label: string;
  status: 'passed' | 'observed' | 'not-found' | 'review' | 'not-run';
  detail: string;
};

export type JourneySummary = {
  profile: 'safe' | 'full';
  stages: JourneyStage[];
  findings: Finding[];
  caution: string;
};

export type InitialGateStep = {
  index: number;
  direction: 'forward' | 'reverse';
  target: string;
  label: string;
  insideGate: boolean;
};

export type InitialGateSummary = {
  detected: boolean;
  label: string | null;
  modalLike: boolean;
  initialFocusInside: boolean | null;
  forwardTabsToGate: number | null;
  reverseTabsToGate: number | null;
  backgroundFocusObserved: boolean;
  forwardPath: InitialGateStep[];
  reversePath: InitialGateStep[];
  findings: Finding[];
};

const names = {
  search: /search|iešk|paiešk/i,
  product: /product|prek|item/i,
  add: /add to (cart|bag)|į krepšel|pirkti|pridėti/i,
  cart: /cart|bag|krepšel/i,
  checkout: /checkout|atsiskaity|apmokėj/i,
};

async function visibleCount(page: Page, selector: string) {
  return page
    .locator(selector)
    .evaluateAll(
      (elements) =>
        elements.filter((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.display !== 'none' &&
            style.visibility !== 'hidden'
          );
        }).length,
    )
    .catch(() => 0);
}

async function settleAfterActivation(page: Page, previousUrl: string) {
  await Promise.race([
    page
      .waitForURL((url) => url.toString() !== previousUrl, { timeout: 2_000 })
      .catch(() => undefined),
    page.waitForTimeout(800),
  ]);
  await page.waitForLoadState('domcontentloaded', { timeout: 3_000 }).catch(() => undefined);
}

async function findInitialGate(page: Page) {
  const selector =
    'dialog[open], [role="dialog"], [aria-modal="true"], [id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i], [id*="privacy" i], [class*="privacy" i]';
  const index = await page
    .locator(selector)
    .evaluateAll((elements) => {
      const language = /cookie|consent|privacy|slapuk|privat/i;
      const candidates = elements
        .map((element, index) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          const visible =
            rect.width > 0 &&
            rect.height > 0 &&
            style.visibility !== 'hidden' &&
            style.display !== 'none';
          const actions = element.querySelectorAll(
            'button, a[href], input, select, [role="button"]',
          ).length;
          const semantic = element.matches('dialog[open], [role="dialog"], [aria-modal="true"]');
          const relevant = semantic || language.test(element.textContent ?? '');
          return {
            index,
            eligible: visible && actions > 0 && relevant,
            score: (semantic ? 1_000_000 : 0) + rect.width * rect.height + actions * 100,
          };
        })
        .filter((candidate) => candidate.eligible)
        .sort((a, b) => b.score - a.score);
      return candidates[0]?.index ?? -1;
    })
    .catch(() => -1);
  return index >= 0 ? page.locator(selector).nth(index) : null;
}

async function describeGate(gate: NonNullable<Awaited<ReturnType<typeof findInitialGate>>>) {
  return gate.evaluate((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const modalLike =
      element.getAttribute('aria-modal') === 'true' ||
      (element instanceof HTMLDialogElement && element.matches(':modal')) ||
      (style.position === 'fixed' && rect.width * rect.height > innerWidth * innerHeight * 0.35);
    const labelledBy = element.getAttribute('aria-labelledby');
    const label =
      element.getAttribute('aria-label') ||
      (labelledBy ? document.getElementById(labelledBy)?.textContent : '') ||
      element.querySelector('h1, h2, h3, [role="heading"]')?.textContent ||
      'Cookie or privacy surface';
    return {
      label: label.trim().replace(/\s+/g, ' ').slice(0, 160),
      modalLike,
      initialFocusInside: element.contains(document.activeElement),
      html: element.outerHTML.slice(0, 900),
    };
  });
}

async function traceToGate(
  page: Page,
  gate: NonNullable<Awaited<ReturnType<typeof findInitialGate>>>,
  direction: 'forward' | 'reverse',
  limit: number,
) {
  const steps: InitialGateStep[] = [];
  for (let index = 1; index <= limit; index += 1) {
    await page.keyboard.press(direction === 'forward' ? 'Tab' : 'Shift+Tab');
    const step = await gate.evaluate(
      (element, values) => {
        const active = document.activeElement as HTMLElement | null;
        const target = active?.id
          ? `#${CSS.escape(active.id)}`
          : (active?.tagName.toLowerCase() ?? 'none');
        const label = [active?.getAttribute('aria-label'), active?.innerText, active?.textContent]
          .filter(Boolean)
          .join(' ')
          .trim()
          .replace(/\s+/g, ' ')
          .slice(0, 120);
        return {
          index: values.index,
          direction: values.direction,
          target,
          label,
          insideGate: Boolean(active && element.contains(active)),
        };
      },
      { index, direction },
    );
    steps.push(step);
    if (step.insideGate) break;
  }
  return steps;
}

export async function runInitialGateAudit(
  page: Page,
  screenshot?: (name: string) => Promise<void>,
  tabLimit = 250,
): Promise<InitialGateSummary> {
  let gate = await findInitialGate(page);
  if (!gate)
    return {
      detected: false,
      label: null,
      modalLike: false,
      initialFocusInside: null,
      forwardTabsToGate: null,
      reverseTabsToGate: null,
      backgroundFocusObserved: false,
      forwardPath: [],
      reversePath: [],
      findings: [],
    };

  const details = await describeGate(gate);
  await screenshot?.('initial-gate-visible');
  const forwardPath = await traceToGate(page, gate, 'forward', tabLimit);
  if (forwardPath.some((step) => !step.insideGate))
    await screenshot?.('initial-gate-background-focus');
  if (forwardPath.at(-1)?.insideGate) await screenshot?.('initial-gate-reached');

  const originalUrl = page.url();
  await page
    .goto(originalUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 })
    .catch(() => undefined);
  await page.waitForTimeout(500);
  gate = await findInitialGate(page);
  const reversePath = gate ? await traceToGate(page, gate, 'reverse', tabLimit) : [];
  const forwardTabsToGate = forwardPath.find((step) => step.insideGate)?.index ?? null;
  const reverseTabsToGate = reversePath.find((step) => step.insideGate)?.index ?? null;
  const backgroundFocusObserved =
    forwardPath.some((step) => !step.insideGate) || reversePath.some((step) => !step.insideGate);
  const findings: Finding[] = [];

  if (details.modalLike && (!details.initialFocusInside || backgroundFocusObserved))
    findings.push({
      id: 'journey:initial-modal-focus-mismatch',
      source: 'journey',
      assessment: 'likely',
      impact: 'serious',
      title: 'Visible consent dialog and keyboard focus are out of sync',
      observed: `“${details.label}” was visible on initial load. Initial focus inside: ${details.initialFocusInside ? 'yes' : 'no'}; forward Tabs to reach it: ${forwardTabsToGate ?? `more than ${tabLimit}`}; reverse Tabs: ${reverseTabsToGate ?? `more than ${tabLimit}`}.`,
      whyItMatters:
        'A keyboard user may interact with the page behind the visually dominant dialog, effectively receiving a different interface from a mouse user.',
      inspect: [
        'Focus placement when consent opens',
        'Native dialog or aria-modal semantics',
        'Background inert state',
        'DOM position of consent actions',
        'Escape behavior and focus restoration',
      ],
      suggestedFixes: [
        'Move focus to a meaningful control or heading inside the modal when it opens.',
        'Make background content inert while the modal is active.',
        'Restore focus predictably after the dialog closes.',
      ],
      manualVerification: [
        'Open a clean browser session and follow the recorded forward and reverse focus paths.',
        'Confirm focus is visibly indicated and background controls cannot be operated.',
      ],
      relatedCriteria: ['WCAG 2.4.3', 'WCAG 2.1.2', 'WCAG 2.4.11'],
      potentialFrameworks: ['WCAG', 'ADA', 'EAA', 'Section 508', 'AODA'],
      helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
      interactionQuestions: ['reach', 'see', 'operate', 'leave'],
      evidence: [
        {
          target: ['Initial consent or privacy surface'],
          html: details.html,
          summary: `${forwardPath.filter((step) => !step.insideGate).length} forward focus stops were observed outside the visible surface before it was reached.`,
        },
      ],
    });
  else if (!details.modalLike && (forwardTabsToGate === null || forwardTabsToGate > 50))
    findings.push({
      id: 'journey:late-consent-focus-path',
      source: 'journey',
      assessment: 'review',
      impact: 'moderate',
      title: 'Consent controls occur late in the keyboard focus path',
      observed: `The visible “${details.label}” surface was reached after ${forwardTabsToGate ?? `more than ${tabLimit}`} forward Tab presses.`,
      whyItMatters:
        'A visually prominent consent surface may be difficult to reach even when it is not implemented as a modal.',
      inspect: [
        'DOM order',
        'Initial focus order',
        'Whether the surface is intended to be modal',
        'Visible focus while traversing the page',
      ],
      suggestedFixes: [
        'Place prominent consent actions at a logical point in DOM and focus order.',
        'If interaction is modal, implement complete modal focus behavior.',
      ],
      manualVerification: [
        'Confirm the intended consent interaction and repeat from a clean session.',
      ],
      relatedCriteria: ['WCAG 2.4.3'],
      potentialFrameworks: ['WCAG', 'ADA', 'EAA', 'Section 508', 'AODA'],
      helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html',
      interactionQuestions: ['reach', 'see', 'operate'],
      evidence: [
        {
          target: ['Initial consent or privacy surface'],
          html: details.html,
          summary: `Forward Tabs to surface: ${forwardTabsToGate ?? `>${tabLimit}`}.`,
        },
      ],
    });

  return {
    detected: true,
    label: details.label,
    modalLike: details.modalLike,
    initialFocusInside: details.initialFocusInside,
    forwardTabsToGate,
    reverseTabsToGate,
    backgroundFocusObserved,
    forwardPath,
    reversePath,
    findings,
  };
}

export async function runJourneyAudit(
  page: Page,
  profile: 'safe' | 'full',
  query: string,
  screenshot?: (name: string) => Promise<void>,
): Promise<JourneySummary> {
  const stages: JourneyStage[] = [];
  const findings: Finding[] = [];
  const search = page
    .locator(
      'input[type="search"], input[role="searchbox"], input[placeholder*="search" i], input[placeholder*="iešk" i], input[aria-label*="search" i], input[aria-label*="iešk" i]',
    )
    .filter({ visible: true })
    .first();
  if (!(await search.isVisible().catch(() => false))) {
    stages.push({
      id: 'search',
      label: 'Search discovery',
      status: 'not-found',
      detail: 'No visible search input was detected for the journey.',
    });
    return {
      profile,
      stages,
      findings,
      caution: 'No purchases or payment submissions are performed.',
    };
  }

  await search.focus();
  await page.keyboard.type(query, { delay: 35 });
  await screenshot?.('journey-search-query');
  stages.push({
    id: 'search',
    label: 'Search query',
    status: 'passed',
    detail: `Entered “${query}” in the detected search control.`,
  });

  if (profile === 'safe') {
    stages.push(
      {
        id: 'results',
        label: 'Search results',
        status: 'not-run',
        detail: 'Navigation is disabled in the safe profile.',
      },
      {
        id: 'product',
        label: 'Product page',
        status: 'not-run',
        detail: 'Navigation is disabled in the safe profile.',
      },
      {
        id: 'cart',
        label: 'Cart interaction',
        status: 'not-run',
        detail: 'Cart modification requires the full profile.',
      },
      {
        id: 'checkout',
        label: 'Checkout entry',
        status: 'not-run',
        detail: 'Checkout is never submitted.',
      },
    );
    return {
      profile,
      stages,
      findings,
      caution: 'Safe profile does not navigate away from the starting page or modify cart state.',
    };
  }

  const searchUrl = page.url();
  await page.keyboard.press('Enter');
  await settleAfterActivation(page, searchUrl);
  await screenshot?.('journey-results');
  stages.push({
    id: 'results',
    label: 'Search results',
    status: 'observed',
    detail: `Continued to ${page.url()}.`,
  });

  let productLink = page
    .locator(
      '[class*="product-card" i] a[href], [data-testid*="product" i] a[href], article[class*="product" i] a[href]',
    )
    .filter({ visible: true })
    .first();
  if (!(await productLink.isVisible().catch(() => false))) {
    productLink = page
      .locator('a[href*="/product/" i], a[href*="/p/"]')
      .filter({ visible: true })
      .first();
  }
  if (await productLink.isVisible().catch(() => false)) {
    await productLink.focus();
    const productUrl = page.url();
    await page.keyboard.press('Enter');
    await settleAfterActivation(page, productUrl);
    await screenshot?.('journey-product');
    stages.push({
      id: 'product',
      label: 'Product page',
      status: 'observed',
      detail: `Opened a detected product link at ${page.url()}.`,
    });
  } else
    stages.push({
      id: 'product',
      label: 'Product page',
      status: 'not-found',
      detail: 'No reliable product link was detected.',
    });

  const variants = await visibleCount(
    page,
    '[role="radio"], input[type="radio"], [class*="variant" i] button, [class*="swatch" i] button',
  );
  stages.push({
    id: 'variants',
    label: 'Product variants',
    status: variants ? 'review' : 'not-found',
    detail: variants
      ? `${variants} possible variant controls detected; selection requires manual review.`
      : 'No variant controls detected.',
  });

  const addButton = page.getByRole('button', { name: names.add }).filter({ visible: true }).first();
  if (await addButton.isVisible().catch(() => false)) {
    await addButton.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1_000);
    await screenshot?.('journey-cart-added');
    stages.push({
      id: 'cart',
      label: 'Add to cart',
      status: 'observed',
      detail: 'Activated a detected add-to-cart control using the keyboard.',
    });
  } else
    stages.push({
      id: 'cart',
      label: 'Add to cart',
      status: 'not-found',
      detail: 'No reliable add-to-cart button was detected.',
    });

  const checkout = page
    .getByRole('button', { name: names.checkout })
    .or(page.getByRole('link', { name: names.checkout }))
    .filter({ visible: true })
    .first();
  stages.push({
    id: 'checkout',
    label: 'Checkout entry',
    status: (await checkout.isVisible().catch(() => false)) ? 'review' : 'not-found',
    detail: 'Checkout was detected where possible but never activated or submitted.',
  });
  return {
    profile,
    stages,
    findings,
    caution:
      'The full profile may modify an isolated cart session, but never submits checkout, payment, authentication or personal data.',
  };
}

export async function runWidgetAudit(page: Page): Promise<Finding[]> {
  const observations = await page.evaluate(() => {
    const visible = (element: Element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden'
      );
    };
    const path = (element: Element) =>
      element.id
        ? `#${CSS.escape(element.id)}`
        : element.tagName.toLowerCase() +
          (element.classList.length ? `.${CSS.escape(element.classList[0]!)}` : '');
    const node = (element: Element, summary: string) => ({
      target: [path(element)],
      html: element.outerHTML.slice(0, 600),
      summary,
    });
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'))
      .filter(visible)
      .filter(
        (element) =>
          !element.hasAttribute('aria-selected') || !element.hasAttribute('aria-controls'),
      )
      .map((element) => node(element, 'Tab is missing aria-selected or aria-controls.'));
    const combos = Array.from(document.querySelectorAll('[role="combobox"]'))
      .filter(visible)
      .filter((element) => !element.hasAttribute('aria-expanded'))
      .map((element) => node(element, 'Combobox is missing aria-expanded.'));
    const expanders = Array.from(document.querySelectorAll('[aria-expanded]'))
      .filter(visible)
      .filter((element) => !element.hasAttribute('aria-controls'))
      .map((element) =>
        node(element, 'Expandable control does not identify the controlled region.'),
      );
    const visibleDialogs = Array.from(
      document.querySelectorAll('dialog[open], [role="dialog"][aria-modal="true"]'),
    ).filter(visible);
    const dialogs = visibleDialogs
      .filter(
        (dialog) => !dialog.getAttribute('aria-label') && !dialog.getAttribute('aria-labelledby'),
      )
      .map((element) => node(element, 'Visible modal dialog has no accessible name.'));
    const focusOutsideDialog =
      visibleDialogs.length > 0 &&
      !visibleDialogs.some((dialog) => dialog.contains(document.activeElement));
    return { tabs, combos, expanders, dialogs, focusOutsideDialog };
  });
  const findings: Finding[] = [];
  const add = (
    id: string,
    title: string,
    evidence: typeof observations.tabs,
    criteria: string[],
  ) => {
    if (!evidence.length) return;
    findings.push({
      id: `journey:${id}`,
      source: 'journey',
      assessment: 'likely',
      impact: 'serious',
      title,
      observed: `${evidence.length} custom widget instance${evidence.length === 1 ? '' : 's'} had incomplete programmatic state or relationships.`,
      whyItMatters:
        'Keyboard and assistive-technology users may not receive the role, state or relationship needed to operate the component.',
      inspect: [
        'Component keyboard pattern',
        'Accessible name, role and state',
        'aria-controls relationships',
        'Focus behavior when state changes',
      ],
      suggestedFixes: [
        'Prefer native controls where possible.',
        'Implement the applicable WAI-ARIA Authoring Practices pattern completely.',
      ],
      manualVerification: [
        'Operate the component with keyboard only.',
        'Verify announcements with a screen reader.',
      ],
      relatedCriteria: criteria,
      potentialFrameworks: ['WCAG', 'ADA', 'EAA', 'Section 508', 'AODA'],
      helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/',
      evidence,
    });
  };
  add('tabs-pattern-risk', 'Tab widget has incomplete relationships', observations.tabs, [
    'WCAG 4.1.2',
  ]);
  add('combobox-pattern-risk', 'Combobox has incomplete state', observations.combos, [
    'WCAG 4.1.2',
  ]);
  add(
    'expanded-control-risk',
    'Expandable control has no controlled-region relationship',
    observations.expanders,
    ['WCAG 4.1.2'],
  );
  add('dialog-name-risk', 'Modal dialog has no accessible name', observations.dialogs, [
    'WCAG 4.1.2',
  ]);
  if (observations.focusOutsideDialog)
    findings.push({
      id: 'journey:dialog-focus-outside',
      source: 'journey',
      assessment: 'likely',
      impact: 'serious',
      title: 'Focus is outside a visible modal dialog',
      observed: 'A modal dialog was visible while the active element remained outside it.',
      whyItMatters:
        'Keyboard users may continue interacting with background content or lose context.',
      inspect: [
        'Initial focus placement',
        'Background inert state',
        'Focus containment',
        'Escape and focus return',
      ],
      suggestedFixes: [
        'Move focus into the dialog when it opens.',
        'Make background content inert while modal.',
        'Return focus to the trigger when it closes.',
      ],
      manualVerification: ['Open the dialog by keyboard and verify the full focus lifecycle.'],
      relatedCriteria: ['WCAG 2.4.3', 'WCAG 2.1.2'],
      potentialFrameworks: ['WCAG', 'ADA', 'EAA', 'Section 508', 'AODA'],
      helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
      evidence: [],
    });

  const trigger = page
    .locator(
      'button[aria-haspopup="dialog"], button[aria-controls*="modal" i], button[aria-controls*="drawer" i]',
    )
    .filter({ visible: true })
    .first();
  if (await trigger.isVisible().catch(() => false)) {
    const triggerSignature = await trigger.evaluate((element) => ({
      id: element.id,
      text: (element.textContent ?? '').trim().slice(0, 100),
    }));
    await trigger.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    const lifecycle = await page.evaluate(() => {
      const visible = (element: Element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.display !== 'none' &&
          style.visibility !== 'hidden'
        );
      };
      const dialog = Array.from(
        document.querySelectorAll(
          'dialog[open], [role="dialog"], [class*="modal" i], [class*="drawer" i]',
        ),
      ).find(visible);
      const active = document.activeElement;
      const nativeModal = dialog instanceof HTMLDialogElement && dialog.matches(':modal');
      const backgroundFocusable =
        dialog && !nativeModal
          ? Array.from(
              document.querySelectorAll(
                'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
              ),
            ).filter(
              (element) =>
                !dialog.contains(element) &&
                visible(element) &&
                !element.closest('[inert], [aria-hidden="true"]'),
            ).length
          : 0;
      return {
        opened: Boolean(dialog),
        focusInside: Boolean(dialog?.contains(active)),
        backgroundFocusable,
      };
    });
    if (lifecycle.opened) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(250);
      const restored = await trigger
        .evaluate((element) => document.activeElement === element)
        .catch(() => false);
      const stillOpen = await page
        .locator('dialog[open], [role="dialog"][aria-modal="true"]')
        .filter({ visible: true })
        .count()
        .catch(() => 0);
      if (!lifecycle.focusInside || lifecycle.backgroundFocusable > 0 || stillOpen > 0 || !restored)
        findings.push({
          id: 'journey:dialog-lifecycle-risk',
          source: 'journey',
          assessment: 'likely',
          impact: 'serious',
          title: 'Dialog focus lifecycle may be incomplete',
          observed: `A dialog trigger was activated. Initial focus inside: ${lifecycle.focusInside ? 'yes' : 'no'}; exposed background controls: ${lifecycle.backgroundFocusable}; Escape closed: ${stillOpen === 0 ? 'yes' : 'no'}; focus returned: ${restored ? 'yes' : 'no'}.`,
          whyItMatters:
            'Incomplete modal focus management can strand keyboard users, expose background content or lose their previous location.',
          inspect: [
            'Initial focus placement',
            'Background inert state',
            'Tab containment',
            'Escape dismissal',
            'Focus restoration to trigger',
          ],
          suggestedFixes: [
            'Use the native dialog element or a complete modal-dialog pattern.',
            'Store the opener and restore focus after close.',
            'Make background content inert while open.',
          ],
          manualVerification: [
            'Open, traverse and close the component using only keyboard.',
            'Repeat with a screen reader.',
          ],
          relatedCriteria: ['WCAG 2.1.2', 'WCAG 2.4.3', 'WCAG 4.1.2'],
          potentialFrameworks: ['WCAG', 'ADA', 'EAA', 'Section 508', 'AODA'],
          helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
          evidence: [
            {
              target: [triggerSignature.id ? `#${triggerSignature.id}` : 'dialog trigger'],
              html: await trigger.evaluate((element) => element.outerHTML.slice(0, 600)),
              summary: triggerSignature.text || 'Detected dialog trigger',
            },
          ],
        });
    }
  }
  return findings;
}

export async function runFormFeedbackAudit(page: Page): Promise<Finding[]> {
  const form = page
    .locator('form:has(input[required], select[required], textarea[required])')
    .filter({ visible: true })
    .first();
  if (!(await form.isVisible().catch(() => false))) return [];
  const submit = form
    .locator('button[type="submit"], input[type="submit"]')
    .filter({ visible: true })
    .first();
  if (!(await submit.isVisible().catch(() => false))) return [];

  const blockMutations = async (route: import('playwright').Route) => {
    if (route.request().method() === 'GET') await route.continue();
    else await route.abort('blockedbyclient');
  };
  await page.route('**/*', blockMutations);
  await submit.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  const result = await form.evaluate((element) => {
    const invalid = Array.from(element.querySelectorAll(':invalid')) as HTMLElement[];
    return invalid.slice(0, 20).map((field) => {
      const id = field.id;
      const describedBy = field.getAttribute('aria-describedby');
      const error = describedBy
        ? describedBy
            .split(/\s+/)
            .map((token) => document.getElementById(token)?.textContent)
            .filter(Boolean)
            .join(' ')
        : '';
      const label = id
        ? document.querySelector(`label[for="${CSS.escape(id)}"]`)?.textContent
        : field.closest('label')?.textContent;
      return {
        target: id ? `#${CSS.escape(id)}` : field.tagName.toLowerCase(),
        html: field.outerHTML.slice(0, 600),
        hasLabel: Boolean(
          label?.trim() ||
          field.getAttribute('aria-label') ||
          field.getAttribute('aria-labelledby'),
        ),
        hasProgrammaticError:
          field.getAttribute('aria-invalid') === 'true' || Boolean(error?.trim()),
        focused: document.activeElement === field,
      };
    });
  });
  await page.unroute('**/*', blockMutations);
  const weak = result.filter((field) => !field.hasLabel || !field.hasProgrammaticError);
  if (!weak.length) return [];
  return [
    {
      id: 'journey:form-error-feedback-risk',
      source: 'journey',
      assessment: 'review',
      impact: 'serious',
      title: 'Required-field errors may lack programmatic feedback',
      observed: `${weak.length} invalid required field${weak.length === 1 ? '' : 's'} lacked a detectable label or associated error state after an empty submission attempt.`,
      whyItMatters:
        'A red border or browser-only cue may not explain what is wrong or how to recover.',
      inspect: [
        'Persistent field labels',
        'aria-invalid',
        'aria-describedby or aria-errormessage',
        'Error summary',
        'Focus after failed submission',
        'Color-only communication',
      ],
      suggestedFixes: [
        'Associate each message with its field.',
        'Describe the error and correction in text.',
        'Move focus to an error summary or first invalid field where appropriate.',
      ],
      manualVerification: [
        'Submit invalid values in the real form without completing a transaction.',
        'Confirm errors are announced by a screen reader and values are preserved.',
      ],
      relatedCriteria: ['WCAG 3.3.1', 'WCAG 3.3.2', 'WCAG 3.3.3'],
      potentialFrameworks: ['WCAG', 'ADA', 'EAA', 'Section 508', 'AODA'],
      helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html',
      evidence: weak.map((field) => ({
        target: [field.target],
        html: field.html,
        summary: `Label: ${field.hasLabel ? 'yes' : 'no'}; associated error: ${field.hasProgrammaticError ? 'yes' : 'no'}; focused: ${field.focused ? 'yes' : 'no'}.`,
      })),
    },
  ];
}
