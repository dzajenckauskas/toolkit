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
  `TOOL_KEYWORDS` in the same file adds action-synonyms for search.
- Processing is client-only (Canvas, Web Crypto, fflate, qrcode, markdown-it).
  No backend, nothing is uploaded.

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
- Current baseline: **261 unit tests + 69 e2e tests, all green.**
- Playwright uses the pre-installed Chromium; do not run `playwright install`.
- Note: `npm audit` reports pre-existing advisories in the Next.js toolchain
  (PostCSS, sharp). `npm audit fix --force` would downgrade Next to v9 — do not
  run it. These are not from app dependencies.

## Recipe: add a tool (the pattern all tools follow)

1. **Pure lib** in `src/lib/<tool>.ts` + `src/lib/<tool>.test.ts` (Vitest). Keep
   logic pure and testable; browser-only bits (canvas, crypto) are exercised by
   e2e.
2. **Component** in `src/components/<Tool>.tsx` (`'use client'`), using the `ui`
   primitives. Give interactive elements stable `data-testid`s.
3. **Route** in `app/<slug>/page.tsx` with `metadata` + a `<Page>`/`<Heading>`.
4. **Flip/add the registry entry** `status: 'live'` and add `TOOL_KEYWORDS`
   action synonyms so the palette finds it by verb.
5. **e2e** in `apps/web/e2e/…spec.ts`.
6. Update `CHANGELOG.md`; run the full suite; commit + push to `main`.

Reusable helpers worth knowing:
- `ImageToolShell` + `src/lib/image.ts` — drop/paste/preview/download for image
  tools (resize/convert/rotate/metadata/favicon).
- `EncodeDecodeTool` — shared encode/decode UI (base64/url/html-entities).
- `src/lib/color.ts` — HEX/RGB/HSL math reused across all the color tools.
- `src/lib/webcrypto.ts` — ArrayBuffer helpers for Web Crypto typings.

## Live tools (48)

- **Images & Media (8):** Compress `/optimize`, Crop `/crop`, Resize `/resize`,
  Convert `/convert`, Rotate & flip `/rotate`, QR code `/qr`, Favicon
  `/favicon`, Screenshot beautifier `/screenshot`
- **Text & Documents (7):** Markdown `/markdown`, Text diff `/text-diff`,
  Lorem Ipsum `/lorem-ipsum`, Case converter `/case-converter`, Line tools
  `/line-tools`, Word counter `/word-count`, Slugify `/slugify`
- **Developer (15):** JSON `/json`, JWT `/jwt`, Regex `/regex`, Base64
  `/base64`, Hash `/hash`, Checksum `/checksum`, UUID `/uuid`, Password
  `/password`, URL encode `/url-encode`, HTML entities `/html-entities`,
  Number base `/number-base`, TOTP/2FA `/totp`, HMAC `/hmac`, Timestamp
  `/timestamp`, CSV↔JSON `/csv-json`
- **Design (10):** Colors `/colors`, Contrast `/contrast`, Palette `/palette`,
  Gradient `/gradient`, Color mixer `/color-mixer`, Blob `/blob`, Theme maker
  `/theme-maker`, Palette from image `/image-palette`, Color blindness
  `/color-blindness`, Color name finder `/color-name`
- **PDF (1):** Images to PDF `/images-to-pdf`
- **Privacy (2):** Metadata cleaner `/metadata-cleaner`, Text encrypt/decrypt
  `/encrypt`
- **Productivity (2):** Focus timer `/focus-timer`, Kanban board `/kanban`
- **Calculators (3):** Notepad calculator `/calculator`, Unit converter
  `/unit-converter`, Percentage `/percentage`

**Command palette:** the home-page search (`ToolCatalog`) is a DevToys /
free-tooling-style palette — searches names, descriptions, categories and
action keywords; rows show a category icon + tag; ↑/↓ + Enter navigate; global
⌘K/Ctrl-K focuses it; empty query falls back to grouped browse cards.

## Dependencies

Kept deliberately small: `fflate` (zip), `qrcode` (QR), `markdown-it` (Markdown,
run with `html:false` = XSS-safe). Everything else is browser-native. A
YAML↔JSON tool was **not** shipped: the only `js-yaml` the registry offered here
resolved to an anomalous `5.2.2` (real latest is 4.x) with a critical advisory,
so it was removed rather than adopted — revisit if a clean version is available.

## Backlog (still `planned` in the registry, 11)

**Needs a library:** Mermaid + Markdown+Mermaid (`mermaid`), Code image
(`shiki`/`prismjs`), and (deferred) YAML↔JSON.
**Heavier custom builds:** Image editor, Text-to-handwriting, Video editor,
Diagram builder, and the rest of the PDF set (PDF editor, Redact PDF —
`pdf-lib`/`pdf.js`).
**Policy / AI deferred:** Upscale (#27), Remove watermark (#28).

## Open decisions for the owner

1. **Product naming** — the header still reads "Ecommerce Toolkit," now
   off-brand (ADR-008 flags naming as unresolved). Needs a chosen name to wire
   through the header, titles and metadata.
2. **Shared image workspace** (#29) — one place to add images then route them
   into any tool (batch/chaining), vs. today's per-tool uploads.
3. **`packages/ui` extraction** (#23) — move the primitives into a workspace
   package now that there are many consumers (ADR-001/006).
4. **Navigation** — the header only links Optimize/Crop; with 48 tools a
   catalog link or sidebar would help sub-pages reach the full set.
5. **Theming** — an accent/theme switcher (the theme-maker tool already proves
   out the token model).

## Pointers

- Decisions: `docs/decisions/` (ADR-008 = the pivot).
- Competitor scans: `docs/research/` (images.net, free-tooling.com).
- Direction: `ROADMAP.md`. Change log: `CHANGELOG.md`.
- GitHub: hub epic **#30**; deferred/decision items #23, #27, #28, #29.
