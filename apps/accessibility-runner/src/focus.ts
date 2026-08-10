import type { Page } from 'playwright';

export type FocusInfo = {
  key: string;
  tag: string;
  type: string | null;
  id: string | null;
  role: string | null;
  ariaLabel: string | null;
  ariaExpanded: string | null;
  ariaControls: string | null;
  ariaAutocomplete: string | null;
  placeholder: string | null;
  name: string | null;
  text: string | null;
  path: string;
  visible: boolean;
  insideSearch: boolean;
};

export type PopupState = {
  ariaExpanded: string | null;
  ariaControls: string | null;
  controlledPopupExists: boolean;
  controlledPopupVisible: boolean;
  visibleListboxes: number;
  visibleOptions: number;
  visibleSearchPopups: number;
  open: boolean | null;
};

export type SearchContext = {
  inputPath: string;
  scopePath: string | null;
  controlsId: string | null;
};

const SEARCH_PATTERN = /ie[sš]k|search|paie[sš]k/i;

export async function getFocusInfo(
  page: Page,
  searchContext: SearchContext | null = null,
): Promise<FocusInfo | null> {
  return page
    .evaluate(
      ({ context, searchSource }) => {
        const active = document.activeElement as HTMLElement | null;
        if (!active) return null;

        const cssPath = (element: Element): string => {
          if (element.id) return `#${CSS.escape(element.id)}`;
          const segments: string[] = [];
          let current: Element | null = element;
          while (current && current !== document.documentElement) {
            let segment = current.tagName.toLowerCase();
            const parent: Element | null = current.parentElement;
            if (parent) {
              const siblings = Array.from(parent.children).filter(
                (child: Element) => child.tagName === current?.tagName,
              );
              if (siblings.length > 1) {
                segment += `:nth-of-type(${siblings.indexOf(current) + 1})`;
              }
            }
            segments.unshift(segment);
            current = parent;
          }
          return segments.join(' > ');
        };

        const visible = (element: Element | null): boolean => {
          if (!(element instanceof HTMLElement)) return false;
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.visibility !== 'hidden' &&
            style.display !== 'none'
          );
        };

        const text = (
          active.innerText ||
          active.getAttribute('value') ||
          active.getAttribute('title') ||
          ''
        )
          .trim()
          .replace(/\s+/g, ' ')
          .slice(0, 120);

        const path = cssPath(active);
        let insideSearch = false;
        if (context) {
          if (path === context.inputPath) insideSearch = true;
          const scope = context.scopePath ? document.querySelector(context.scopePath) : null;
          const controlled = context.controlsId
            ? document.getElementById(context.controlsId)
            : null;
          insideSearch =
            insideSearch ||
            Boolean(scope?.contains(active)) ||
            Boolean(controlled?.contains(active));
        }

        if (!insideSearch) {
          const searchAncestor = active.closest(
            '[role="search"], [class*="search" i], [id*="search" i], [class*="autocomplete" i], [class*="suggest" i]',
          );
          insideSearch = Boolean(searchAncestor);
        }

        const tag = active.tagName;
        const type = active instanceof HTMLInputElement ? active.type : null;
        const id = active.id || null;
        const role = active.getAttribute('role');
        const ariaLabel = active.getAttribute('aria-label');
        const placeholder = active.getAttribute('placeholder');
        const name = active.getAttribute('name');
        const key = [tag, id, role, ariaLabel, name, text, path].join('|');

        return {
          key,
          tag,
          type,
          id,
          role,
          ariaLabel,
          ariaExpanded: active.getAttribute('aria-expanded'),
          ariaControls: active.getAttribute('aria-controls'),
          ariaAutocomplete: active.getAttribute('aria-autocomplete'),
          placeholder,
          name,
          text: text || null,
          path,
          visible: visible(active),
          insideSearch,
          _searchMatch: searchSource,
        };
      },
      { context: searchContext, searchSource: SEARCH_PATTERN.source },
    )
    .then((value) => {
      if (!value) return null;
      const { _searchMatch: _, ...focus } = value;
      return focus;
    });
}

export function isSearchInput(focus: FocusInfo | null): boolean {
  if (!focus || !['INPUT', 'TEXTAREA'].includes(focus.tag)) return false;
  if (focus.tag === 'INPUT' && !['text', 'search', null].includes(focus.type)) {
    return false;
  }
  const attributes = [focus.placeholder, focus.ariaLabel, focus.name, focus.id, focus.role]
    .filter(Boolean)
    .join(' ');
  return (
    SEARCH_PATTERN.test(attributes) ||
    /^(q|query|keyword|keywords)$/i.test(focus.name ?? '') ||
    /^(searchbox|combobox)$/i.test(focus.role ?? '')
  );
}

export async function captureSearchContext(page: Page): Promise<SearchContext> {
  return page.evaluate(() => {
    const input = document.activeElement as HTMLElement;

    const cssPath = (element: Element): string => {
      if (element.id) return `#${CSS.escape(element.id)}`;
      const segments: string[] = [];
      let current: Element | null = element;
      while (current && current !== document.documentElement) {
        let segment = current.tagName.toLowerCase();
        const parent: Element | null = current.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children).filter(
            (child: Element) => child.tagName === current?.tagName,
          );
          if (siblings.length > 1) {
            segment += `:nth-of-type(${siblings.indexOf(current) + 1})`;
          }
        }
        segments.unshift(segment);
        current = parent;
      }
      return segments.join(' > ');
    };

    const scope = input.closest('[role="search"], [class*="search" i], [id*="search" i], form');
    return {
      inputPath: cssPath(input),
      scopePath: scope ? cssPath(scope) : null,
      controlsId: input.getAttribute('aria-controls'),
    };
  });
}

export async function getPopupState(page: Page, context: SearchContext): Promise<PopupState> {
  return page.evaluate((searchContext) => {
    const input = document.querySelector(searchContext.inputPath);
    const visible = (element: Element | null): boolean => {
      if (!(element instanceof HTMLElement)) return false;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== 'hidden' &&
        style.display !== 'none'
      );
    };
    const countVisible = (selector: string) =>
      Array.from(document.querySelectorAll(selector)).filter(visible).length;

    const ariaExpanded = input?.getAttribute('aria-expanded') ?? null;
    const ariaControls = input?.getAttribute('aria-controls') ?? searchContext.controlsId;
    const controlledPopup = ariaControls ? document.getElementById(ariaControls) : null;
    const controlledPopupVisible = visible(controlledPopup);
    const visibleListboxes = countVisible('[role="listbox"]');
    const visibleOptions = countVisible('[role="option"]');
    const visibleSearchPopups = countVisible(
      '[class*="autocomplete" i], [class*="suggest" i], [class*="search-results" i], [id*="search-results" i]',
    );

    let open: boolean | null = null;
    if (ariaExpanded === 'true') open = true;
    else if (ariaExpanded === 'false') open = false;
    else if (controlledPopupVisible || visibleListboxes > 0 || visibleSearchPopups > 0) {
      open = true;
    }

    return {
      ariaExpanded,
      ariaControls,
      controlledPopupExists: Boolean(controlledPopup),
      controlledPopupVisible,
      visibleListboxes,
      visibleOptions,
      visibleSearchPopups,
      open,
    };
  }, context);
}

export function focusLabel(focus: FocusInfo | null): string {
  if (!focus) return 'none';
  const name = focus.ariaLabel || focus.placeholder || focus.text || focus.name;
  return `${focus.tag.toLowerCase()}${focus.id ? `#${focus.id}` : ''}${name ? ` (${name.slice(0, 60)})` : ''}`;
}
