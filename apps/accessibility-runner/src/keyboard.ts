import type { Page } from 'playwright';
import {
  captureSearchContext,
  focusLabel,
  getFocusInfo,
  getPopupState,
  isSearchInput,
  type FocusInfo,
  type PopupState,
  type SearchContext,
} from './focus.js';

export type FocusStep = {
  action: string;
  focus: FocusInfo | null;
  timestamp: string;
};

export type TrapClassification = 'no-trap-observed' | 'possible-trap' | 'inconclusive';

export type KeyboardAudit = {
  searchFound: boolean;
  searchTabIndex: number | null;
  context: SearchContext | null;
  popupBeforeEscape: PopupState | null;
  popupAfterEscape: PopupState | null;
  escapeClosedPopup: boolean | null;
  focusPath: FocusStep[];
  forwardEscapedSearch: boolean;
  reverseEscapedSearch: boolean;
  repeatedFocusKeys: string[];
  classification: TrapClassification;
  reasons: string[];
};

type KeyboardOptions = {
  maxSearchTabs: number;
  forwardTabs: number;
  reverseTabs: number;
  stepDelayMs: number;
};

const now = () => new Date().toISOString();

async function pressAndCapture(
  page: Page,
  key: string,
  label: string,
  path: FocusStep[],
  context: SearchContext | null,
  delayMs: number,
): Promise<FocusInfo | null> {
  await page.keyboard.press(key);
  if (delayMs > 0) await page.waitForTimeout(delayMs);
  const focus = await getFocusInfo(page, context);
  path.push({ action: label, focus, timestamp: now() });
  console.log(`${label.padEnd(18)} -> ${focusLabel(focus)}`);
  return focus;
}

export async function findSearchByKeyboard(
  page: Page,
  options: KeyboardOptions,
  path: FocusStep[],
): Promise<{ index: number; context: SearchContext } | null> {
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    document.body.focus();
  });

  for (let index = 1; index <= options.maxSearchTabs; index += 1) {
    const focus = await pressAndCapture(
      page,
      'Tab',
      `Search Tab ${index}`,
      path,
      null,
      options.stepDelayMs,
    );
    if (isSearchInput(focus)) {
      return { index, context: await captureSearchContext(page) };
    }
  }
  return null;
}

function repeatedKeys(steps: FocusStep[]): string[] {
  const counts = new Map<string, number>();
  for (const { focus } of steps) {
    if (!focus) continue;
    counts.set(focus.key, (counts.get(focus.key) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key);
}

function classify(
  forward: FocusStep[],
  reverse: FocusStep[],
  escapeClosedPopup: boolean | null,
): Pick<
  KeyboardAudit,
  | 'classification'
  | 'reasons'
  | 'forwardEscapedSearch'
  | 'reverseEscapedSearch'
  | 'repeatedFocusKeys'
> {
  const forwardEscapedSearch = forward.some(({ focus }) => focus && !focus.insideSearch);
  const reverseEscapedSearch = reverse.some(({ focus }) => focus && !focus.insideSearch);
  const repeatedFocusKeys = repeatedKeys([...forward, ...reverse]);
  const forwardFocus = forward.map(({ focus }) => focus).filter(Boolean);
  const reverseFocus = reverse.map(({ focus }) => focus).filter(Boolean);
  const enoughEvidence = forwardFocus.length >= 5 && reverseFocus.length >= 3;
  const allInside =
    forwardFocus.every((focus) => focus?.insideSearch) &&
    reverseFocus.every((focus) => focus?.insideSearch);
  const hasLoopEvidence = repeatedFocusKeys.length > 0;
  const reasons: string[] = [];

  if (escapeClosedPopup === false) reasons.push('Escape did not close the detected popup.');
  if (forwardEscapedSearch) reasons.push('Forward Tab moved focus outside the search UI.');
  else reasons.push('Forward Tab did not move focus outside the detected search UI.');
  if (reverseEscapedSearch) reasons.push('Shift+Tab moved focus outside the search UI.');
  else reasons.push('Shift+Tab did not move focus outside the detected search UI.');
  if (hasLoopEvidence) reasons.push('One or more focus targets repeated.');

  let classification: TrapClassification = 'inconclusive';
  if (forwardEscapedSearch || reverseEscapedSearch) {
    classification = 'no-trap-observed';
  } else if (enoughEvidence && allInside && hasLoopEvidence) {
    classification = 'possible-trap';
  } else {
    reasons.push('The captured path was insufficient for a confident heuristic result.');
  }

  return {
    classification,
    reasons,
    forwardEscapedSearch,
    reverseEscapedSearch,
    repeatedFocusKeys,
  };
}

export async function runKeyboardAudit(
  page: Page,
  options: KeyboardOptions,
  screenshot: (name: string) => Promise<void>,
): Promise<KeyboardAudit> {
  const focusPath: FocusStep[] = [];
  const found = await findSearchByKeyboard(page, options, focusPath);

  if (!found) {
    await screenshot('search-not-found');
    const bodyText = await page
      .locator('body')
      .innerText()
      .catch(() => '');
    const accessBlocked =
      /access denied|you don't have permission|cf-chl-|cloudflare|verify you are human/i.test(
        bodyText,
      );
    const tail = focusPath
      .slice(-Math.min(10, focusPath.length))
      .map(({ focus }) => focus?.key ?? 'none');
    const repeatedOnOneTarget =
      !accessBlocked && tail.length >= 10 && new Set(tail).size === 1 && tail[0] !== 'none';
    return {
      searchFound: false,
      searchTabIndex: null,
      context: null,
      popupBeforeEscape: null,
      popupAfterEscape: null,
      escapeClosedPopup: null,
      focusPath,
      forwardEscapedSearch: false,
      reverseEscapedSearch: false,
      repeatedFocusKeys: repeatedOnOneTarget ? [tail[0]!] : [],
      classification: repeatedOnOneTarget ? 'possible-trap' : 'inconclusive',
      reasons: [
        `Search input was not found within ${options.maxSearchTabs} Tab presses.`,
        ...(accessBlocked
          ? ['The storefront returned an access-control or bot-protection page.']
          : []),
        ...(repeatedOnOneTarget
          ? [`Focus remained on the same target for the final ${tail.length} Tab presses.`]
          : []),
      ],
    };
  }

  console.log(`Search found at Tab ${found.index}.`);
  await page.waitForTimeout(400);
  const popupBeforeEscape = await getPopupState(page, found.context);
  await screenshot('search-focused');

  await pressAndCapture(page, 'Escape', 'Escape', focusPath, found.context, 350);
  const popupAfterEscape = await getPopupState(page, found.context);
  await screenshot('after-escape');

  const escapeClosedPopup =
    popupBeforeEscape.open === true
      ? popupAfterEscape.open === false
      : popupBeforeEscape.open === null
        ? null
        : true;

  const forward: FocusStep[] = [];
  for (let index = 1; index <= options.forwardTabs; index += 1) {
    await pressAndCapture(
      page,
      'Tab',
      `Forward Tab ${index}`,
      forward,
      found.context,
      options.stepDelayMs,
    );
  }
  focusPath.push(...forward);

  const reverse: FocusStep[] = [];
  for (let index = 1; index <= options.reverseTabs; index += 1) {
    await pressAndCapture(
      page,
      'Shift+Tab',
      `Reverse Tab ${index}`,
      reverse,
      found.context,
      options.stepDelayMs,
    );
  }
  focusPath.push(...reverse);

  return {
    searchFound: true,
    searchTabIndex: found.index,
    context: found.context,
    popupBeforeEscape,
    popupAfterEscape,
    escapeClosedPopup,
    focusPath,
    ...classify(forward, reverse, escapeClosedPopup),
  };
}

export async function runQueryInteraction(
  page: Page,
  options: KeyboardOptions,
  query: string,
  screenshot?: (name: string) => Promise<void>,
): Promise<FocusStep[]> {
  const path: FocusStep[] = [];
  const found = await findSearchByKeyboard(page, options, path);
  if (!found) return path;

  await page.keyboard.type(query, { delay: 60 });
  await page.waitForTimeout(700);
  path.push({
    action: `Type ${JSON.stringify(query)}`,
    focus: await getFocusInfo(page, found.context),
    timestamp: now(),
  });
  await screenshot?.('query-open');

  for (const [key, label] of [
    ['ArrowDown', 'Arrow Down'],
    ['ArrowUp', 'Arrow Up'],
    ['Escape', 'Query Escape'],
  ] as const) {
    await pressAndCapture(page, key, label, path, found.context, options.stepDelayMs);
    if (key === 'Escape') await screenshot?.('query-after-escape');
  }

  for (let index = 1; index <= 12; index += 1) {
    await pressAndCapture(
      page,
      'Tab',
      `Query Tab ${index}`,
      path,
      found.context,
      options.stepDelayMs,
    );
  }
  for (let index = 1; index <= 8; index += 1) {
    await pressAndCapture(
      page,
      'Shift+Tab',
      `Query Shift+Tab ${index}`,
      path,
      found.context,
      options.stepDelayMs,
    );
  }
  return path;
}
