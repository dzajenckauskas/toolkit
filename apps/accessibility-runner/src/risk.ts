import type { Page } from 'playwright';

export type RiskNode = {
  target: string[];
  html: string;
  failureSummary: string;
};

export type RiskFinding = {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  confidence: 'high' | 'medium' | 'low';
  assessment: 'confirmed' | 'likely' | 'review';
  help: string;
  description: string;
  helpUrl: string;
  tags: string[];
  nodes: RiskNode[];
  observed?: string;
  whyItMatters?: string;
  inspect?: string[];
  suggestedFixes?: string[];
  manualVerification?: string[];
  relatedCriteria?: string[];
};

export type RiskSummary = {
  findings: RiskFinding[];
  focusTargetsTested: number;
  checks: string[];
};

type FocusSample = {
  key: string;
  target: string;
  html: string;
  label: string;
  hasIndicator: boolean;
  obscured: boolean;
  width: number;
  height: number;
  compactControl: boolean;
  inViewport: boolean;
  domIndex: number;
  top: number;
  left: number;
  coveringTargets: string[];
  pixelChanged?: boolean;
};

const focusHelp = 'https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html';
const obscuredHelp = 'https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html';
const orderHelp = 'https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html';
const targetHelp = 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html';
const keyboardHelp = 'https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html';
const bypassHelp = 'https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html';

async function captureFocusSample(page: Page): Promise<FocusSample | null> {
  return page.evaluate(async () => {
    const element = document.activeElement as HTMLElement | null;
    if (!element || element === document.body || element === document.documentElement) return null;

    const cssPath = (node: Element): string => {
      if (node.id) return `#${CSS.escape(node.id)}`;
      const parts: string[] = [];
      let current: Element | null = node;
      while (current && current !== document.documentElement && parts.length < 5) {
        let part = current.tagName.toLowerCase();
        const parent: Element | null = current.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children).filter(
            (child) => child.tagName === current?.tagName,
          );
          if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
        }
        parts.unshift(part);
        current = parent;
      }
      return parts.join(' > ');
    };

    const styleSnapshot = () => {
      const style = getComputedStyle(element);
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
        outlineColor: style.outlineColor,
        boxShadow: style.boxShadow,
        borderColor: style.borderColor,
        borderWidth: style.borderWidth,
        backgroundColor: style.backgroundColor,
        color: style.color,
        textDecoration: style.textDecoration,
      };
    };

    const focused = styleSnapshot();
    element.blur();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const unfocused = styleSnapshot();
    element.focus({ preventScroll: true });
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const restored = styleSnapshot();

    const visibleOutline =
      restored.outlineStyle !== 'none' &&
      parseFloat(restored.outlineWidth) >= 1 &&
      restored.outlineColor !== 'transparent' &&
      restored.outlineColor !== 'rgba(0, 0, 0, 0)';
    const visibleShadow = restored.boxShadow !== 'none';
    const changed = (
      ['borderColor', 'borderWidth', 'backgroundColor', 'color', 'textDecoration'] as const
    ).some((property) => restored[property] !== unfocused[property]);
    const hasIndicator =
      visibleOutline ||
      visibleShadow ||
      changed ||
      JSON.stringify(focused) !== JSON.stringify(unfocused);

    const rect = element.getBoundingClientRect();
    const inset = Math.min(4, rect.width / 4, rect.height / 4);
    const points: Array<[number, number]> = [
      [rect.left + rect.width / 2, rect.top + rect.height / 2],
      [rect.left + inset, rect.top + inset],
      [rect.right - inset, rect.top + inset],
      [rect.left + inset, rect.bottom - inset],
      [rect.right - inset, rect.bottom - inset],
    ];
    const inViewport =
      rect.bottom > 0 && rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth;
    const coveringTargets = new Set<string>();
    const exposedPoints = points.filter(([x, y]) => {
      if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return false;
      const top = document.elementFromPoint(x, y);
      if (top && top !== element && !element.contains(top) && !top.contains(element))
        coveringTargets.add(cssPath(top));
      return Boolean(top && (top === element || element.contains(top) || top.contains(element)));
    }).length;
    const focusable = Array.from(
      document.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );

    const label = [
      element.getAttribute('aria-label'),
      element.innerText,
      element.getAttribute('title'),
    ]
      .filter(Boolean)
      .join(' ')
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 120);
    const role = element.getAttribute('role');
    const compactControl =
      ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName) ||
      ['button', 'checkbox', 'radio', 'switch', 'combobox'].includes(role ?? '');
    return {
      key: cssPath(element),
      target: cssPath(element),
      html: element.outerHTML.slice(0, 600),
      label,
      hasIndicator,
      width: Math.round(rect.width * 10) / 10,
      height: Math.round(rect.height * 10) / 10,
      compactControl,
      inViewport,
      domIndex: focusable.indexOf(element),
      top: Math.round(rect.top),
      left: Math.round(rect.left),
      coveringTargets: [...coveringTargets].slice(0, 5),
      obscured: inViewport && exposedPoints === 0,
    };
  });
}

async function confirmRenderedFocusChange(page: Page, sample: FocusSample): Promise<boolean> {
  const locator = page.locator(sample.target).first();
  try {
    const focused = await locator.screenshot({ animations: 'disabled', timeout: 2_000 });
    await locator.evaluate((element) => (element as HTMLElement).blur());
    await page.waitForTimeout(30);
    const unfocused = await locator.screenshot({ animations: 'disabled', timeout: 2_000 });
    await locator.evaluate((element) => (element as HTMLElement).focus({ preventScroll: true }));
    return !focused.equals(unfocused);
  } catch {
    return sample.hasIndicator;
  }
}

export async function runRiskAudit(
  page: Page,
  maxTabs = 45,
  evidence?: (name: string) => Promise<void>,
): Promise<RiskSummary> {
  await page.evaluate(() => {
    (document.activeElement as HTMLElement | null)?.blur();
    document.body.focus();
  });

  const samples = new Map<string, FocusSample>();
  let evidenceCount = 0;
  for (let index = 0; index < maxTabs; index += 1) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(35);
    const sample = await captureFocusSample(page);
    if (sample && !samples.has(sample.key)) {
      if (!sample.hasIndicator) {
        sample.pixelChanged = await confirmRenderedFocusChange(page, sample);
        sample.hasIndicator = sample.pixelChanged;
      }
      samples.set(sample.key, sample);
      if (evidence && evidenceCount < 6 && (!sample.hasIndicator || sample.obscured)) {
        evidenceCount += 1;
        await evidence(`risk-focus-${evidenceCount}`);
      }
    }
  }

  const staticRisks = await page.evaluate(() => {
    const visible = (element: Element) => {
      const node = element as HTMLElement;
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
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
      failureSummary: summary,
    });
    const positiveTabindex = Array.from(document.querySelectorAll('[tabindex]'))
      .filter((element) => Number(element.getAttribute('tabindex')) > 0 && visible(element))
      .slice(0, 20)
      .map((element) =>
        node(
          element,
          `Positive tabindex ${element.getAttribute('tabindex')} can override the natural focus order.`,
        ),
      );
    const customControls = Array.from(
      document.querySelectorAll('div[onclick], span[onclick], [role="button"]'),
    )
      .filter((element) => {
        if (!visible(element)) return false;
        const tag = element.tagName;
        if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT') return false;
        return !element.hasAttribute('tabindex') || Number(element.getAttribute('tabindex')) < 0;
      })
      .slice(0, 20)
      .map((element) => node(element, 'Custom control is not in the normal keyboard tab order.'));
    const firstFocusable = document.querySelector(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const firstText = [
      firstFocusable?.getAttribute('aria-label'),
      (firstFocusable as HTMLElement | null)?.innerText,
      firstFocusable?.textContent,
    ]
      .filter(Boolean)
      .join(' ');
    const firstHref = firstFocusable?.getAttribute('href') ?? '';
    const skipLink =
      /skip|pereiti|praleisti|pagrindin/i.test(firstText) && firstHref.startsWith('#');
    return {
      positiveTabindex,
      customControls,
      skipLink,
      firstFocusable: firstFocusable
        ? node(
            firstFocusable,
            'The first keyboard target does not appear to bypass repeated navigation.',
          )
        : null,
    };
  });

  const findings: RiskFinding[] = [];
  const missingFocus = [...samples.values()].filter((sample) => !sample.hasIndicator);
  if (missingFocus.length)
    findings.push({
      id: 'focus-indicator-risk',
      impact: 'serious',
      confidence: 'medium',
      assessment: 'likely',
      help: 'Keyboard focus may not be visibly indicated',
      description:
        'Focused controls showed no detectable outline, shadow, border, color, or decoration change. Confirm visually because custom indicators can evade computed-style checks.',
      helpUrl: focusHelp,
      tags: ['wcag2aa', 'wcag247', 'custom-check'],
      observed: `${missingFocus.length} keyboard target${missingFocus.length === 1 ? '' : 's'} showed no computed-style or rendered-pixel change when focused.`,
      whyItMatters:
        'Without a visible focus cursor, sighted keyboard users cannot reliably tell which control will respond.',
      inspect: [
        'Global outline removal',
        ':focus versus :focus-visible selectors',
        'Focus color contrast',
        'Indicators clipped by overflow',
      ],
      suggestedFixes: [
        'Provide a persistent, high-contrast :focus-visible indicator.',
        'Avoid removing the browser outline without an equivalent replacement.',
      ],
      manualVerification: [
        'View the focused-state screenshots.',
        'Repeat with keyboard in the target browser and judge visibility against adjacent colors.',
      ],
      relatedCriteria: ['WCAG 2.4.7', 'WCAG 2.4.11'],
      nodes: missingFocus.slice(0, 20).map((sample) => ({
        target: [sample.target],
        html: sample.html,
        failureSummary: `No visible focus-style change detected${sample.label ? ` on “${sample.label}”` : ''}.`,
      })),
    });

  const obscured = [...samples.values()].filter((sample) => sample.obscured);
  if (obscured.length)
    findings.push({
      id: 'focus-obscured-risk',
      impact: 'serious',
      confidence: 'medium',
      assessment: 'likely',
      help: 'Focused elements may be obscured',
      description:
        'A focused target was covered at its sampled points by another rendered element. Sticky headers, consent layers and drawers are common causes.',
      helpUrl: obscuredHelp,
      tags: ['wcag22aa', 'wcag2411', 'custom-check'],
      observed: `${obscured.length} focused target${obscured.length === 1 ? '' : 's'} were covered at all sampled points.`,
      whyItMatters:
        'Keyboard users may move focus to a control they cannot see or operate in context.',
      inspect: [
        'Sticky headers and footers',
        'Consent overlays',
        'Drawer stacking contexts',
        'scroll-margin around focused elements',
      ],
      suggestedFixes: [
        'Scroll focused content clear of persistent overlays.',
        'Close or make blocking layers modal and manage focus inside them.',
      ],
      relatedCriteria: ['WCAG 2.4.11'],
      nodes: obscured.slice(0, 20).map((sample) => ({
        target: [sample.target],
        html: sample.html,
        failureSummary: `The focused target was covered by: ${sample.coveringTargets.join(', ') || 'another rendered layer'}.`,
      })),
    });

  const smallTargets = [...samples.values()].filter(
    (sample) => sample.compactControl && (sample.width < 24 || sample.height < 24),
  );
  if (smallTargets.length)
    findings.push({
      id: 'target-size-risk',
      impact: 'moderate',
      confidence: 'low',
      assessment: 'review',
      help: 'Some controls may have undersized targets',
      description:
        'Controls smaller than 24×24 CSS pixels were observed. WCAG includes spacing and essential-control exceptions, so these are manual-review candidates.',
      helpUrl: targetHelp,
      tags: ['wcag22aa', 'wcag258', 'custom-check'],
      observed: `${smallTargets.length} sampled control${smallTargets.length === 1 ? '' : 's'} measured below 24×24 CSS pixels in at least one dimension.`,
      whyItMatters:
        'Small targets can be difficult for people with limited dexterity or touch precision.',
      inspect: [
        'Rendered target dimensions',
        'Spacing from adjacent targets',
        'Inline and essential-control exceptions',
      ],
      suggestedFixes: [
        'Increase the clickable area without necessarily enlarging the visual icon.',
        'Provide sufficient spacing where an exception permits it.',
      ],
      relatedCriteria: ['WCAG 2.5.8'],
      nodes: smallTargets.slice(0, 20).map((sample) => ({
        target: [sample.target],
        html: sample.html,
        failureSummary: `Measured approximately ${sample.width}×${sample.height} CSS pixels.`,
      })),
    });

  if (staticRisks.positiveTabindex.length)
    findings.push({
      id: 'positive-tabindex-risk',
      impact: 'moderate',
      confidence: 'high',
      assessment: 'confirmed',
      help: 'Positive tabindex overrides natural focus order',
      description:
        'Positive tabindex values create a separate keyboard order that can diverge from the visual and DOM order.',
      observed: `${staticRisks.positiveTabindex.length} visible element${staticRisks.positiveTabindex.length === 1 ? '' : 's'} used a positive tabindex.`,
      whyItMatters:
        'Positive tabindex overrides the natural document sequence and can create an unexpected focus path.',
      inspect: ['Component tabindex management', 'DOM order', 'Roving tabindex patterns'],
      suggestedFixes: [
        'Use tabindex="0" for custom focusable controls and align DOM order with visual order.',
      ],
      relatedCriteria: ['WCAG 2.4.3'],
      helpUrl: orderHelp,
      tags: ['wcag2a', 'wcag243', 'custom-check'],
      nodes: staticRisks.positiveTabindex,
    });
  if (staticRisks.customControls.length)
    findings.push({
      id: 'custom-control-keyboard-risk',
      impact: 'serious',
      confidence: 'high',
      assessment: 'likely',
      help: 'Custom controls may be unreachable by keyboard',
      description:
        'Visible non-native controls with click/button behavior were not included in the normal tab order.',
      observed: `${staticRisks.customControls.length} visible custom control${staticRisks.customControls.length === 1 ? '' : 's'} were excluded from the normal tab order.`,
      whyItMatters:
        'A mouse user may be able to activate functionality that keyboard users cannot reach.',
      inspect: [
        'Generic elements with click handlers',
        'Missing tabindex',
        'Enter and Space keyboard behavior',
        'Accessible role and name',
      ],
      suggestedFixes: [
        'Use a native button or link.',
        'If a custom control is unavoidable, implement focus, keyboard behavior, role, name and state.',
      ],
      relatedCriteria: ['WCAG 2.1.1', 'WCAG 4.1.2'],
      helpUrl: keyboardHelp,
      tags: ['wcag2a', 'wcag211', 'custom-check'],
      nodes: staticRisks.customControls,
    });
  if (!staticRisks.skipLink && staticRisks.firstFocusable)
    findings.push({
      id: 'skip-link-risk',
      impact: 'moderate',
      confidence: 'low',
      assessment: 'review',
      help: 'No skip-navigation link detected at the start of the page',
      description:
        'The first focusable element did not look like an in-page bypass link. Other bypass mechanisms may exist and should be checked manually.',
      observed: 'The first keyboard target did not appear to be an in-page skip mechanism.',
      whyItMatters:
        'Keyboard and screen-reader users may need to traverse repeated navigation on every page.',
      inspect: [
        'Skip-to-content link',
        'Landmarks and headings',
        'Whether the skip target receives focus and is not obscured',
      ],
      suggestedFixes: [
        'Add a visible-on-focus skip link to the main content.',
        'Ensure the target exists and focus moves to it.',
      ],
      relatedCriteria: ['WCAG 2.4.1'],
      helpUrl: bypassHelp,
      tags: ['wcag2a', 'wcag241', 'custom-check'],
      nodes: [staticRisks.firstFocusable],
    });

  const offscreenFocused = [...samples.values()].filter(
    (sample) => !sample.inViewport || sample.width === 0 || sample.height === 0,
  );
  if (offscreenFocused.length)
    findings.push({
      id: 'hidden-focusable-risk',
      impact: 'serious',
      confidence: 'medium',
      assessment: 'likely',
      help: 'Hidden elements may remain keyboard focusable',
      description:
        'Focusable elements without a rendered box were found outside explicitly hidden or inert regions.',
      observed: `${offscreenFocused.length} keyboard-focused element${offscreenFocused.length === 1 ? '' : 's'} had no visible rendered box or remained outside the viewport.`,
      whyItMatters:
        'Focus can disappear into collapsed, responsive or off-screen interface copies.',
      inspect: [
        'Responsive duplicate navigation',
        'Collapsed accordions and drawers',
        'visibility/display styles',
        'inert and hidden state management',
      ],
      suggestedFixes: [
        'Remove hidden controls from the tab order.',
        'Use hidden or inert state consistently when components are closed.',
      ],
      manualVerification: ['Tab through the affected region at each responsive breakpoint.'],
      relatedCriteria: ['WCAG 2.4.3', 'WCAG 2.4.7'],
      helpUrl: orderHelp,
      tags: ['wcag2a', 'wcag243', 'custom-check'],
      nodes: offscreenFocused.map((sample) => ({
        target: [sample.target],
        html: sample.html,
        failureSummary: `Focused at ${sample.width}×${sample.height} CSS pixels, viewport-visible: ${sample.inViewport ? 'yes' : 'no'}.`,
      })),
    });

  const ordered = [...samples.values()].filter((sample) => sample.inViewport);
  const reversals = ordered.slice(1).flatMap((sample, index) => {
    const previous = ordered[index];
    return previous && sample.top + 120 < previous.top
      ? [
          {
            target: [sample.target],
            html: sample.html,
            failureSummary: `Focus moved visually backward from y=${previous.top} to y=${sample.top}.`,
          },
        ]
      : [];
  });
  if (reversals.length >= 3)
    findings.push({
      id: 'visual-focus-order-risk',
      impact: 'moderate',
      confidence: 'low',
      assessment: 'review',
      help: 'Keyboard focus may diverge from the visual order',
      description: 'Several large backward jumps were observed between sequential focus targets.',
      observed: `${reversals.length} visually backward focus transitions were sampled.`,
      whyItMatters:
        'A focus sequence that conflicts with the apparent layout can be disorienting and difficult to follow.',
      inspect: [
        'CSS order properties',
        'Grid placement',
        'DOM order',
        'Responsive duplicate components',
        'Portaled content',
      ],
      suggestedFixes: [
        'Keep DOM, reading and visual order aligned.',
        'Avoid using CSS ordering to create a substantially different interaction sequence.',
      ],
      manualVerification: [
        'Watch the focus indicator through the full page and judge whether the sequence preserves meaning.',
      ],
      relatedCriteria: ['WCAG 2.4.3', 'WCAG 1.3.2'],
      helpUrl: orderHelp,
      tags: ['wcag2a', 'wcag243', 'custom-check'],
      nodes: reversals.slice(0, 20),
    });

  return {
    findings,
    focusTargetsTested: samples.size,
    checks: [
      'focus visibility',
      'focus obstruction',
      'target size candidates',
      'positive tabindex',
      'custom control keyboard reachability',
      'skip navigation',
    ],
  };
}
