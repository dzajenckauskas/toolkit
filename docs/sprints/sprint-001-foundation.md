# Sprint 001 — Image Optimizer Foundation

- Status: In review
- Date: 2026-07-23
- Related ADR: [ADR-005](../decisions/ADR-005-client-side-image-processing.md)

## Goal

Stand up the application foundation and ship the first deliberately narrow
vertical slice of the Image Optimizer: **one JPEG in, one optimized JPEG out**,
processed entirely in the browser.

This sprint establishes the technical stack (per the open items in
`ROADMAP.md` Phase 0) without expanding the optimizer beyond a single,
trustworthy path.

## In scope

- Bootstrap `apps/web` with Next.js (App Router), TypeScript (strict), and
  tooling for linting, formatting, unit testing, and browser testing.
- The `/optimize` route.
- The first vertical slice:
  - accept one JPEG via file picker or drag and drop
  - validate the file (type, empty, size limit)
  - show preview, filename, dimensions, format, and size
  - optimize locally in the browser with one balanced default
  - show output size and percentage saved (honestly, including "no reduction")
  - download the optimized file
  - clear errors for unsupported or corrupt files
  - correct cleanup of object URLs and temporary resources
- Responsive, accessible interface.

## Explicitly out of scope (this sprint)

Deferred deliberately; see MVP scope and roadmap for where these land:

- Accounts, database, cloud uploads, projects, billing
- AI features
- Batch processing, multiple-image queue, ZIP export
- PNG and WebP support (optimizer input stays JPEG-only for now)
- Compression controls / quality slider (one balanced default only)
- Clipboard paste
- Shared packages under `packages/` (no second use case yet — ADR-001)

## Approach

Browser-local JPEG re-encoding using the Canvas API. Rationale, alternatives,
and limitations are recorded in [ADR-005](../decisions/ADR-005-client-side-image-processing.md).

## Acceptance criteria

- [x] `apps/web` builds and runs on Next.js + strict TypeScript
- [x] `/optimize` accepts one JPEG via picker and drag-and-drop
- [x] Invalid files (empty, non-JPEG, oversized) are rejected with a clear message
- [x] Corrupt JPEGs produce a decode error rather than a broken result
- [x] Original preview, filename, dimensions, format, and size are shown
- [x] Output size and percentage saved are shown, including the honest
      "already well optimized" case when re-encoding does not shrink the file
- [x] The optimized file can be downloaded with a sensible filename
- [x] Object URLs are revoked on replacement and unmount
- [x] Unit tests cover validation, filename generation, size math, and formatting
- [x] Browser tests cover a successful optimize + download and failure handling
- [x] Lint, format, type-check, and unit tests pass

## Findings

See `docs/technical/README.md` → "Image processing (Sprint 001 findings)".

## Follow-up candidates (not this sprint)

- Quality/compression control once users ask for it (MVP "desirable" list).
- PNG/WebP support (own sprint; different encoder tradeoffs).
- Batch queue + ZIP export (roadmap Phase 1).
- Extract shared preview/file-queue components only once a second tool needs
  them (ADR-001).
- WASM encoder (e.g. mozjpeg) if canvas quality/ratio proves insufficient.
