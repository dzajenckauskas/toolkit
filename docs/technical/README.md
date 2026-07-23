# Technical Documentation

## Application (as of Sprint 001)

The web application lives in `apps/web`.

- **Framework:** Next.js (App Router).
- **Language:** TypeScript in `strict` mode, plus `noUncheckedIndexedAccess`,
  `noUnusedLocals`, and `noUnusedParameters`.
- **Routing:** one route per standalone tool. The first is `/optimize`.
- **Processing:** client-side only. No backend, no database, no uploads.
- **Styling:** CSS-in-JS via Emotion, MUI-style `styled` API with a typed theme
  (ADR-006). Reusable primitives in `src/components/ui/`; design tokens in
  `src/theme/`. No global stylesheet — a single Emotion `<Global>` holds the
  reset and the light/dark color tokens.
- **Linting/formatting:** ESLint (`next/core-web-vitals`, `next/typescript`)
  and Prettier.
- **Unit tests:** Vitest + Testing Library (jsdom) for pure logic.
- **Browser tests:** Playwright driving Chromium for the real optimize flow.

No shared `packages/*` exist yet. Per ADR-001, shared foundations are extracted
only after a second tool creates a concrete reuse case; `src/components/ui/` is
structured so that extraction is a move, not a rewrite (ADR-006).

## Naming conventions

- **React components** — `PascalCase.tsx`, one primary component per file, file
  name equal to the component (e.g. `Button.tsx`, `Page.tsx`, `Heading.tsx`).
- **Non-component modules** (logic, hooks, style helpers) — `camelCase.ts`
  (e.g. `validation.ts`, `buttonStyles.ts`). Hooks are `useThing.ts`.
- **Tests** — co-located `*.test.ts(x)`. **Type declarations** — `*.d.ts`.
- **Next.js files** — framework-reserved lowercase names (`page.tsx`,
  `layout.tsx`) as required.
- **Directories** — lowercase (`components`, `ui`, `lib`, `theme`).
- **Identifiers** — components/types `PascalCase`; variables/functions
  `camelCase`; module constants `UPPER_SNAKE_CASE`. Booleans read as predicates
  (`isDragging`, `hasItems`). Event-handler props are `onX`; their handler
  implementations are `handleX`.
- **Docs/ADRs** — `kebab-case.md` (`ADR-00N-short-title.md`).

## UI components & theming

- `src/theme/theme.ts` — typed design tokens (colors reference CSS variables).
- `src/theme/GlobalStyles.tsx` — the only global CSS: reset + `:root` tokens
  with a `prefers-color-scheme` dark block (zero-JS dark mode).
- `src/theme/EmotionRegistry.tsx` — App Router SSR registry
  (`useServerInsertedHTML`) so first paint is styled and hydration matches.
- `src/components/ui/` — primitives (`Button`/`ButtonLink`/`DownloadLink`,
  `Stack`, `Card`, `Text`, `Page`, `Heading`, `VisuallyHidden`). The barrel is
  pure re-exports so unused primitives tree-shake away.

### Structure

```
apps/web/
  app/                     App Router routes (/, /optimize)
  src/lib/                 Pure, unit-tested logic
    validation.ts          File validation (type, empty, size)
    filename.ts            Output filename generation
    format.ts              Human-readable byte formatting
    savings.ts             Original-vs-output size math
    optimize.ts            Canvas decode/encode (browser-only)
    constants.ts           Scope constants (accepted types, quality, limits)
  src/components/          Client UI (Optimizer)
  e2e/                     Playwright specs + fixtures
```

The pure logic in `src/lib` is separated from the browser-only canvas code in
`optimize.ts` so the former is fully unit-testable in jsdom and the latter is
covered by Playwright.

## Image processing (Sprint 001 findings)

Chosen approach: browser-local JPEG re-encoding via the Canvas API. Full
rationale, alternatives, and limitations are in
[ADR-005](../decisions/ADR-005-client-side-image-processing.md).

Pipeline: decode file → `HTMLImageElement` → draw to `<canvas>` →
`canvas.toBlob('image/jpeg', quality)`.

Quality is chosen via a small set of named levels (`src/lib/quality.ts`): Low
(0.6), Balanced (0.8, the default), High (0.92). Balanced reuses the original
Sprint 001 default so the untouched fast path is unchanged. Changing the level
re-optimizes every queued image in place, and the choice is remembered in
`localStorage` (`src/lib/settings.ts`) — privacy-safe (setting only, never image
data) and fully defensive: private mode, disabled storage, or quota errors fall
back to the default without breaking the tool. It is restored on mount (client
only), so there is no hydration mismatch.

Multiple images are handled as a queue (`src/lib/queue.ts` holds the pure shape
and aggregate math; the component owns files and object URLs). Each item decodes
and encodes independently, so one corrupt file fails on its own without
affecting the batch. Per-item object URLs are revoked on remove, on re-optimize
(swap-then-revoke), on clear, and on unmount.

A batch of 2+ optimized images can be downloaded as a single ZIP
(`src/lib/zip.ts`, via `fflate` — stored at level 0, not re-compressed; filenames
de-duplicated). Built and downloaded entirely in the browser (ADR-007).

### Findings

- **It works and it saves.** A 900×700 detailed JPEG fixture went from
  609,175 → 232,521 bytes (**61.8% smaller**) at the balanced `0.8` quality.
- **Truly local.** No image bytes leave the browser; verified under Playwright.
- **Honest reporting is required.** Re-encoding can enlarge an already-optimized
  JPEG, so the UI reports the real delta and shows an explicit "already well
  optimized" state rather than inventing a saving.
- **Metadata is dropped** by the canvas re-encode (EXIF/orientation/GPS). Fine
  for web product images, but not lossless — the UI never claims otherwise.
- **Object-URL hygiene matters.** Every `URL.createObjectURL` is paired with a
  revoke on replacement and on unmount to avoid leaks during repeated use.

### Known limitations / risks

- JPEG input only. PNG/WebP are deferred (different encoder tradeoffs).
- Very large images may hit canvas memory limits, **notably on Mobile Safari**,
  which can silently down-scale or fail. Not reproducible in this environment;
  a 25 MB input cap is enforced and the risk is tracked as unverified.

## Testing

- `npm run test` — Vitest unit tests (validation, filename, size math, formatting).
- `npm run test:e2e` — Playwright browser tests (optimize + download, corrupt
  file, unsupported file).
- The Playwright config points at the environment's pre-installed Chromium via
  `executablePath`; override with `CHROMIUM_PATH` elsewhere, or set it to a
  browser installed by `npx playwright install`.

## Still to be documented (future sprints)

- supported browser and format matrix (with real device testing)
- performance budgets
- deployment and observability
- broader testing strategy as more tools arrive
