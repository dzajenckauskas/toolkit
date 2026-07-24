# Project state & handoff

_Living document. Update it at the end of a work session so the next one can
start cold. Last updated: 2026-07-24._

## What this is

A **general-purpose, free, client-side browser tool hub** — many small tools
under one roof, every one running locally with **no account, no upload, no
paywall**. The pivot from the original "ecommerce image toolkit" framing is
recorded in **ADR-008** (`docs/decisions/ADR-008-pivot-to-browser-tool-hub.md`).

Monetization is deferred; this is currently a personal project ("build all the
tools first, decide on monetization later").

## Where the code lives

- App: `apps/web` — Next.js 15 (App Router), React 19, TypeScript strict.
- Styling: Emotion CSS-in-JS with a typed theme (`src/theme/`), zero-JS
  light/dark via CSS variables. Shared primitives in `src/components/ui/`.
- **Tool registry** (`src/tools/registry.ts`) is the single source of truth:
  every tool is one entry; the catalog, search and command palette read from it.
- Processing is client-only (Canvas for images, Web Crypto for hashing, fflate
  for ZIP). No backend, nothing is uploaded.

## Workflow conventions (important)

- **Work directly on `main`** (owner preference for velocity) — no PR per change.
- **Run the full local suite before every push** and keep `main` green:
  ```
  cd apps/web
  npx tsc --noEmit
  npx next lint --max-warnings=0
  npx prettier --write "src/**/*.{ts,tsx}" "app/**/*.{ts,tsx}" "e2e/**/*.ts"
  npx vitest run
  npx playwright test        # builds first
  ```
- Current baseline: **147 unit tests + 40 e2e tests, all green.**
- Playwright uses the pre-installed Chromium; do not run `playwright install`.

## Recipe: add a tool (the pattern all 20 follow)

1. **Pure lib** in `src/lib/<tool>.ts` + `src/lib/<tool>.test.ts` (Vitest). Keep
   logic pure and testable; browser-only bits (canvas) are exercised by e2e.
2. **Component** in `src/components/<Tool>.tsx` (`'use client'`), using the `ui`
   primitives. Give interactive elements stable `data-testid`s.
3. **Route** in `app/<slug>/page.tsx` with `metadata` + a `<Page>`/`<Heading>`.
4. **Flip the registry entry** `status: 'planned' → 'live'` (and add
   `TOOL_KEYWORDS` action synonyms so the palette finds it by verb).
5. **e2e** in `apps/web/e2e/…spec.ts`.
6. Update `CHANGELOG.md`; run the full suite; commit + push to `main`.

Image tools reuse `ImageToolShell` (drop/paste/preview/download) and
`src/lib/image.ts` (format + geometry helpers).

## Live tools (20)

| Category | Tools (route) |
|---|---|
| Images & Media | Compress `/optimize`, Crop `/crop`, Resize `/resize`, Convert `/convert`, Rotate & flip `/rotate`, Favicon `/favicon` |
| Developer | UUID `/uuid`, Base64 `/base64`, Password `/password`, JSON `/json`, Hash `/hash`, JWT `/jwt`, Regex `/regex`, Checksum `/checksum` |
| Text & Documents | Lorem Ipsum `/lorem-ipsum`, Text diff `/text-diff` |
| Design | Colors `/colors` |
| Privacy | Metadata cleaner `/metadata-cleaner` |
| Productivity | Focus timer `/focus-timer` |
| Calculators | Notepad calculator `/calculator` |

**Command palette:** the home-page search (`ToolCatalog`) is a DevToys /
free-tooling-style palette — searches names, descriptions, categories and
action keywords; rows show a category icon + tag; ↑/↓ + Enter navigate; global
⌘K/Ctrl-K focuses it; empty query falls back to grouped browse cards.

## Backlog (still `planned` in the registry)

**Needs a small third-party library** (only `fflate` is used so far — adding
deps is a real decision, flagged to the owner):
- QR code, Markdown preview, Mermaid diagram, Markdown+Mermaid, Code image
  (syntax highlight), and a JSON↔YAML converter (DevToys parity).

**Heavier custom builds** (no new dep, but large):
- Screenshot beautifier, full Image editor, Kanban board, Images→PDF, PDF
  editor, Redact PDF, Video editor, Text-to-handwriting, Diagram builder.

**Policy / AI deferred** (see issues):
- **Upscale** (#27) — real quality needs AI super-resolution; conflicts with
  no-backend/privacy-local. Do not ship a naive canvas upscale.
- **Remove watermark** (#28) — legal/ethical; do **not** build a general
  remover. Only ever a strictly "your own watermark" scope after an owner call.

## Open decisions for the owner

1. **Product naming** — the header still reads "Ecommerce Toolkit," now
   off-brand (ADR-008 flags naming as unresolved). Needs a chosen name to wire
   through the header, titles and metadata.
2. **Introduce dependencies?** — required to ship QR / Markdown / Mermaid.
3. **Shared image workspace** (#29) — one place to add images then route them
   into any tool (batch/chaining), vs. today's per-tool uploads.
4. **`packages/ui` extraction** (#23) — move the primitives into a workspace
   package now that there are many consumers (ADR-001/006).
5. **Navigation** — the header only links Optimize/Crop; with 20 tools a
   catalog link or sidebar would help sub-pages reach the full set.
6. **Theming** — optional accent/theme switcher on top of the existing tokens.

## Pointers

- Decisions: `docs/decisions/` (ADR-008 = the pivot).
- Competitor scans: `docs/research/` (images.net, free-tooling.com).
- Direction: `ROADMAP.md`. Change log: `CHANGELOG.md`.
- GitHub issues track deferred/decision items (#23, #27, #28, #29) and the hub
  epic.
