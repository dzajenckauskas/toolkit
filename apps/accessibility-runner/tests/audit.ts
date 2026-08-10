import path from 'node:path';
import process from 'node:process';
import { chromium, type BrowserContext, type Page } from 'playwright';
import { runAxeAudit } from '../src/axe.js';
import { buildFrameworkSummary } from '../src/compliance.js';
import { analyzeStability, buildFindings } from '../src/findings.js';
import {
  runKeyboardAudit,
  runQueryInteraction,
  type FocusStep,
  type TrapClassification,
} from '../src/keyboard.js';
import { ensureResultsDir, safeTimestamp, writeJson } from '../src/report.js';
import { runRiskAudit } from '../src/risk.js';
import {
  runFormFeedbackAudit,
  runInitialGateAudit,
  runJourneyAudit,
  runWidgetAudit,
} from '../src/journey.js';
import { assertSafeRemoteUrl } from '../src/network-safety.js';

type CliOptions = {
  url: string;
  headless: boolean;
  repeats: number;
  maxSearchTabs: number;
  stepDelayMs: number;
  query: string;
  failOnTrap: boolean;
  profile: 'safe' | 'full';
};

function parseCli(argv: string[]): CliOptions {
  const value = (name: string) => {
    const inline = argv.find((arg) => arg.startsWith(`${name}=`));
    if (inline) return inline.slice(name.length + 1);
    const index = argv.indexOf(name);
    const next = index >= 0 ? argv[index + 1] : undefined;
    return next && !next.startsWith('--') ? next : undefined;
  };
  const consumedValues = new Set(
    ['--url', '--repeats', '--max-search-tabs', '--step-delay', '--query', '--profile']
      .map((name) => {
        const index = argv.indexOf(name);
        return index >= 0 ? argv[index + 1] : undefined;
      })
      .filter(Boolean),
  );
  const positional = argv.find((arg) => !arg.startsWith('--') && !consumedValues.has(arg));
  const url = value('--url') ?? positional ?? 'https://pigu.lt';
  try {
    new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }
  return {
    url,
    headless: argv.includes('--headless') || !argv.includes('--headed'),
    repeats: Number(value('--repeats') ?? '2'),
    maxSearchTabs: Number(value('--max-search-tabs') ?? '80'),
    stepDelayMs: Number(value('--step-delay') ?? '120'),
    query: value('--query') ?? 'telefonas',
    failOnTrap: argv.includes('--fail-on-trap'),
    profile: value('--profile') === 'full' ? 'full' : 'safe',
  };
}

function classifyQueryInteraction(steps: FocusStep[]) {
  const forward = steps.filter(({ action }) => /^Query Tab \d+$/.test(action));
  const reverse = steps.filter(({ action }) => /^Query Shift\+Tab \d+$/.test(action));
  const forwardEscapedSearch = forward.some(({ focus }) => focus && !focus.insideSearch);
  const reverseEscapedSearch = reverse.some(({ focus }) => focus && !focus.insideSearch);
  const tail = forward.slice(-6).map(({ focus }) => focus?.key ?? 'none');
  const reverseKeys = reverse.map(({ focus }) => focus?.key ?? 'none');
  const stuckOnOneTarget = tail.length >= 6 && new Set([...tail, ...reverseKeys]).size === 1;
  const allInside = [...forward, ...reverse].every(({ focus }) => focus?.insideSearch === true);
  const classification: TrapClassification =
    forwardEscapedSearch || reverseEscapedSearch
      ? 'no-trap-observed'
      : allInside && stuckOnOneTarget
        ? 'possible-trap'
        : 'inconclusive';
  return {
    classification,
    forwardEscapedSearch,
    reverseEscapedSearch,
    stuckOnOneTarget,
    repeatedTarget: stuckOnOneTarget ? tail[0] : null,
  };
}

async function loadFresh(page: Page, url: string): Promise<void> {
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
      const usableDocument = await page
        .locator('body')
        .count()
        .catch(() => 0);
      if (usableDocument && page.url() !== 'about:blank') {
        console.log(
          `Navigation warning: continuing with the rendered document after ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`,
        );
        lastError = null;
        break;
      }
      if (attempt < 2) await page.waitForTimeout(1_000);
    }
  }
  if (lastError)
    throw new Error(
      `Could not load ${url}: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
    );
  await page.waitForTimeout(1_500);
}

async function dismissConsentByKeyboard(page: Page): Promise<boolean> {
  await page.waitForTimeout(1_500);
  const consentNames = [
    /patvirtinti visus/i,
    /leisti visus/i,
    /priimti visus/i,
    /accept all/i,
    /allow all/i,
    /sutinku/i,
  ];
  const consentVisible = await Promise.all(
    consentNames.flatMap((name) => [
      page
        .getByRole('button', { name })
        .first()
        .isVisible()
        .catch(() => false),
      page
        .getByRole('link', { name })
        .first()
        .isVisible()
        .catch(() => false),
    ]),
  );
  if (!consentVisible.some(Boolean)) return false;

  for (let index = 0; index < 10; index += 1) {
    await page.keyboard.press('Tab');
    const active = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null;
      return {
        interactive:
          active?.tagName === 'BUTTON' ||
          active?.tagName === 'A' ||
          active?.getAttribute('role') === 'button',
        label: [active?.getAttribute('aria-label'), active?.innerText, active?.textContent]
          .filter(Boolean)
          .join(' ')
          .trim(),
      };
    });
    if (
      active.interactive &&
      /patvirtinti visus|leisti visus|priimti visus|accept all|allow all|sutinku/i.test(
        active.label,
      )
    ) {
      console.log(`Consent setup       -> ${active.label.split(/\s+/).slice(0, 5).join(' ')}`);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(400);
      return true;
    }
  }
  return false;
}

async function newAuditPage(context: BrowserContext, url: string): Promise<Page> {
  const page = await context.newPage();
  await loadFresh(page, url);
  if (await dismissConsentByKeyboard(page)) {
    await loadFresh(page, url);
  }
  return page;
}

const options = parseCli(process.argv.slice(2));
const shopHost = new URL(options.url).hostname.replace(/^www\./, '');
const shopSlug = shopHost.replace(/[^a-z0-9]+/gi, '-');
const resultsRoot = path.resolve(
  process.env.ACCESSIBILITY_RESULTS_DIR ?? process.env.ACCESSCOPE_RESULTS_DIR ?? 'results',
);
const runDirectory = path.join(resultsRoot, shopSlug, safeTimestamp());
await ensureResultsDir(runDirectory);

const browser = await chromium.launch({ headless: options.headless });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  locale: 'lt-LT',
  colorScheme: 'light',
  serviceWorkers: 'block',
});
await context.routeWebSocket(/.*/, async (webSocket) => {
  await webSocket.close({
    code: 1008,
    reason: 'WebSockets are disabled during accessibility audits.',
  });
});
const blockedHosts = new Set<string>();
await context.route('**/*', async (route) => {
  const requestUrl = route.request().url();
  const protocol = new URL(requestUrl).protocol;
  if (['data:', 'blob:', 'about:'].includes(protocol)) return await route.continue();
  try {
    await assertSafeRemoteUrl(requestUrl);
    await route.continue();
  } catch {
    const hostname = new URL(requestUrl).hostname;
    if (!blockedHosts.has(hostname)) {
      blockedHosts.add(hostname);
      console.log(`Blocked private or unsafe browser request: ${hostname}`);
    }
    await route.abort('blockedbyclient');
  }
});
// tsx/esbuild preserves function names with this helper. Playwright serializes
// page callbacks without the helper, so provide its harmless browser equivalent.
await context.addInitScript({
  content: 'globalThis.__name = (target) => target;',
});

const keyboardOptions = {
  maxSearchTabs: options.maxSearchTabs,
  forwardTabs: 20,
  reverseTabs: 12,
  stepDelayMs: options.stepDelayMs,
};

const startedAt = new Date().toISOString();
const audits = [];
let axe = null;
let risks = null;
let queryInteraction = null;
let journey = null;
let initialGate = null;

try {
  console.log('\nInspecting the initial cookie and modal state...');
  const initialPage = await context.newPage();
  await loadFresh(initialPage, options.url);
  initialGate = await runInitialGateAudit(initialPage, async (name) => {
    await initialPage.screenshot({ path: path.join(runDirectory, `${name}.png`), fullPage: false });
  });
  await initialPage.close();

  for (let repeat = 1; repeat <= options.repeats; repeat += 1) {
    console.log(`\nKeyboard audit ${repeat}/${options.repeats}: ${options.url}`);
    const page = await newAuditPage(context, options.url);
    const audit = await runKeyboardAudit(page, keyboardOptions, async (name) => {
      await page.screenshot({
        path: path.join(runDirectory, `${repeat}-${name}.png`),
        fullPage: false,
      });
    });
    audits.push({ repeat, ...audit });
    await writeJson(runDirectory, `focus-path-${repeat}.json`, audit.focusPath);
    await page.close();
  }

  console.log(`\nQuery interaction: ${JSON.stringify(options.query)}`);
  const queryPage = await newAuditPage(context, options.url);
  queryInteraction = await runQueryInteraction(
    queryPage,
    keyboardOptions,
    options.query,
    async (name) => {
      await queryPage.screenshot({
        path: path.join(runDirectory, `${name}.png`),
        fullPage: false,
      });
    },
  );
  await queryPage.screenshot({
    path: path.join(runDirectory, 'query-interaction.png'),
    fullPage: false,
  });
  await writeJson(runDirectory, 'query-focus-path.json', queryInteraction);
  await queryPage.close();

  console.log('\nRunning axe structural accessibility scan...');
  const axePage = await newAuditPage(context, options.url);
  axe = await runAxeAudit(axePage);
  await axePage.close();

  console.log('\nRunning interaction risk checks...');
  const riskPage = await newAuditPage(context, options.url);
  risks = await runRiskAudit(riskPage, 45, async (name) => {
    await riskPage.screenshot({
      path: path.join(runDirectory, `${name}.png`),
      fullPage: false,
    });
  });
  const widgetFindings = await runWidgetAudit(riskPage);
  const formFindings = options.profile === 'full' ? await runFormFeedbackAudit(riskPage) : [];
  await riskPage.close();

  console.log(`\nRunning ${options.profile} ecommerce journey...`);
  const journeyPage = await newAuditPage(context, options.url);
  journey = await runJourneyAudit(journeyPage, options.profile, options.query, async (name) => {
    await journeyPage.screenshot({ path: path.join(runDirectory, `${name}.png`), fullPage: false });
  });
  journey.stages.unshift({
    id: 'initial-gate',
    label: 'Initial consent or modal state',
    status: initialGate.detected ? 'observed' : 'not-found',
    detail: initialGate.detected
      ? `${initialGate.label}; initial focus inside: ${initialGate.initialFocusInside ? 'yes' : 'no'}; forward Tabs to controls: ${initialGate.forwardTabsToGate ?? '>250'}.`
      : 'No visible cookie, privacy or modal surface was detected on clean load.',
  });
  journey.findings.push(...initialGate.findings, ...widgetFindings, ...formFindings);
  await journeyPage.close();
} finally {
  await browser.close();
}

const classifications = audits.map(({ classification }) => classification);
const queryAnalysis = classifyQueryInteraction(queryInteraction ?? []);
const overall: TrapClassification =
  classifications.includes('possible-trap') || queryAnalysis.classification === 'possible-trap'
    ? 'possible-trap'
    : classifications.every((value) => value === 'no-trap-observed')
      ? 'no-trap-observed'
      : 'inconclusive';
const stability = analyzeStability(audits);
const findings = buildFindings({
  axe,
  risks,
  audits,
  queryPossibleTrap: queryAnalysis.classification === 'possible-trap',
  journey,
  stability,
});

const report = {
  title: `${shopHost} search keyboard accessibility audit`,
  startedAt,
  finishedAt: new Date().toISOString(),
  browser: 'Chromium',
  inputMethod: 'keyboard-only',
  url: options.url,
  query: options.query,
  overall,
  caution:
    'A possible-trap result is a heuristic candidate for manual confirmation, not a standalone WCAG conformance verdict.',
  audits,
  queryInteraction,
  queryAnalysis,
  axe,
  risks,
  journey,
  initialGate,
  stability,
  findings,
  environment: {
    viewport: { width: 1440, height: 1000 },
    locale: 'lt-LT',
    colorScheme: 'light',
    repeats: options.repeats,
    profile: options.profile,
  },
  frameworks: buildFrameworkSummary(axe, risks, overall === 'possible-trap', findings),
};

await writeJson(runDirectory, 'report.json', report);
console.log(`\nResult: ${overall}`);
console.log(`Report: ${path.join(runDirectory, 'report.json')}`);
console.log(`Axe violations: ${axe?.violations.length ?? 'not run'}`);

if (options.failOnTrap && overall === 'possible-trap') process.exitCode = 2;
