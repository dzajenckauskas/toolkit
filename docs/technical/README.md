# Technical Documentation

## Application (as of Sprint 001)

The web application lives in `apps/web`.

- **Framework:** Next.js (App Router).
- **Language:** TypeScript in `strict` mode, plus `noUncheckedIndexedAccess`,
  `noUnusedLocals`, and `noUnusedParameters`.
- **Routing:** one route per standalone tool. The first is `/optimize`.
- **Processing:** client-side only. No backend, no database, no uploads.
- **Linting/formatting:** ESLint (`next/core-web-vitals`, `next/typescript`)
  and Prettier.
- **Unit tests:** Vitest + Testing Library (jsdom) for pure logic.
- **Browser tests:** Playwright driving Chromium for the real optimize flow.

No shared `packages/*` exist yet. Per ADR-001, shared foundations are extracted
only after a second tool creates a concrete reuse case.

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
re-optimizes every queued image in place.

Multiple images are handled as a queue (`src/lib/queue.ts` holds the pure shape
and aggregate math; the component owns files and object URLs). Each item decodes
and encodes independently, so one corrupt file fails on its own without
affecting the batch. Per-item object URLs are revoked on remove, on re-optimize
(swap-then-revoke), on clear, and on unmount.

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
