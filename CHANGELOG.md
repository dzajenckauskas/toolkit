# Changelog

Meaningful product, architecture, workflow, and scope changes are recorded here.

## Unreleased

### Added

- **SEO & discoverability pass.** Now that the site is live at
  toolkit.zajenckauskas.lt, added the metadata plumbing a public 48-page site
  needs, all driven off the tool registry so it stays in sync automatically:
  - **`app/sitemap.ts`** — generated from `LIVE_TOOLS` (+ home/FAQ/Terms), so a
    tool is indexed the moment its `status` flips to `live` (51 URLs today).
  - **`app/robots.ts`** — allow-all with a `Sitemap:`/`Host:` pointer.
  - **`app/manifest.ts`** — installable web manifest themed to the paper palette.
  - **Root metadata** gained `metadataBase`, a `%s · toolkit` title template,
    site-wide OpenGraph/Twitter card defaults, keywords, and a canonical base.
  - **Per-tool metadata** now comes from `src/lib/seo.ts` (`toolMetadata`/
    `pageMetadata`): every one of the 48 tool pages plus FAQ/Terms gets an
    accurate title, description, **canonical URL** and OG/Twitter cards derived
    from the registry — replacing hand-written blocks that had already drifted
    (e.g. Crop still said "Ecommerce Toolkit").
  - **Light/dark SVG favicons** (`favicon-light.svg`/`favicon-dark.svg`, shared
    with the danielius site) wired via `metadata.icons` with
    `prefers-color-scheme` media queries.
- **Landing-page layout for every tool.** Each of the 48 tool pages now renders
  through a shared `ToolPage` template: a hero (category eyebrow, heading,
  tagline and the interactive tool in a framed workspace), a "How it works"
  three-step walkthrough, highlight cards, a per-tool FAQ, and a dark
  "Explore more tools" band linking related tools in the same category. The
  layout follows the reference design while keeping the existing warm/teal
  palette. Content comes from `src/tools/content.ts`: bespoke copy for the
  flagship image tools (Compress, Crop, Resize, Convert, Rotate, QR, Favicon,
  Images→PDF) and sensible defaults derived from the registry for the rest.
- **Shared FAQ accordion** (`FaqAccordion`) used by both the standalone FAQ page
  and each tool page's "Frequent questions" section.

- **Global search dialog.** A search icon in the header (and ⌘K / Ctrl-K from
  anywhere) opens a command palette that searches every tool by name,
  description, category and action keywords, with arrow-key navigation and
  Enter-to-open. Works on every route, not just the catalog. The home page's
  inline catalog search is unchanged; the duplicate ⌘K binding was moved to the
  header so the two no longer conflict.
- **Mobile drawer lists individual tools.** The slide-in menu now groups every
  live tool under its category (free-tooling.com style) with a theme toggle and
  "Send feedback" in a pinned footer, and slides in from the left. Category
  labels remain jump-links to the catalog sections.

- **FAQ page** (`/faq`) — a keyboard-accessible accordion (native
  `<details>`/`<summary>`) answering common questions about the free,
  client-side, no-upload model.
- **Terms & Conditions page** (`/terms`) — plain-language terms for the
  free, browser-only tool hub (as-is / no-warranty, local-only processing,
  local-storage note, liability, contact).
- **Site footer** — an author credit ("Built by Danielius", linking to
  zajenckauskas.lt) plus FAQ, Contact and Terms links, mounted app-wide and
  pinned to the bottom on short pages.
- **Contact** — a `mailto:` link (danielius@zajenckauskas.lt) in the header,
  footer and mobile menu; shared site constants live in `src/lib/site.ts`.

### Changed

- **One shared search component.** The inline catalog search and the header
  search dialog now share a single `useToolSearch` hook (query + keyboard) and
  `ToolResults` list, instead of each carrying its own copy of the result-row
  markup and styling.

### Fixed

- **Layout width jumped when the scrollbar appeared/disappeared.** Reserved the
  scrollbar gutter globally (`scrollbar-gutter: stable`), so centered layouts
  keep a constant width — the search results now match the unfiltered catalog
  grid, and an expanding FAQ item no longer nudges the column width.
- **Mobile menu drawer not opening (clipped to the header).** The drawer is
  `position: fixed`, but the header sets `backdrop-filter`, which makes the
  header a *containing block* for fixed descendants — so the drawer (rendered
  inside the header) was sized to the ~50px header instead of the viewport,
  showing only its top strip with no overlay or links. The drawer (and the new
  search dialog) are now portalled to `<body>`, escaping that containing block.
- **Mobile menu drawer horizontal overflow / phantom header.** The off-canvas
  drawer was `position: fixed` and slid off to the right when closed, which
  widened the page by its own width — producing a horizontal scrollbar, an empty
  gap on the right, and the drawer's header peeking in at the top-right (most
  visible in full-page screenshots). Refactored the drawer so it is fully
  self-contained: overlay and panel now live inside a single fixed,
  viewport-sized container (`inset: 0; overflow: hidden`); the panel is
  absolutely positioned within it and slides in from off its clipped right edge,
  so it can never extend the document or produce a scrollbar. When closed the
  container is inert (`pointer-events: none`) and `visibility: hidden` (after the
  slide-out), keeping its links out of the keyboard tab order. No global
  overflow hacks needed. Verified at 1280 / 768 / 375 widths.

### Changed

- **Header quick links** now point to **FAQ** and **Contact** (replacing the
  previous Compress / Crop / Palette shortcuts); the mobile drawer gained a
  "More" section with FAQ, Contact and Terms.
- **Design system reskin — "danielius" theme.** Reskinned the app to match the
  danielius design system while keeping the existing architecture (Emotion,
  typed theme, `data-theme` light/dark toggle). Ported the full palette — a warm
  off-white paper light mode and a blue-slate dark mode, both with a muted
  teal/sage "ink" accent (mapped onto `--accent`/`--accent-strong`, with a new
  `--subtle` third-tier text token) — into the CSS variables in
  `GlobalStyles.tsx` and the typed tokens in `theme.ts`. Adopted danielius'
  **typography**: self-hosted **Neris** (Light/SemiBold/Black, via
  `next/font/local`) as the display/body sans with **Geist Sans** fallback and
  **Geist Mono** for numerals, a light (300) body weight, and heavy (900),
  tightly-tracked headings. Softened the radii (large rounded cards, ~0.85rem
  inputs, **pill buttons**), added soft tight-spread shadows, and restyled the
  UI primitives + native controls to suit — primary buttons are ink-filled pills
  that lift on hover, secondary/ghost buttons are bordered pills. Both light and
  dark modes and all 48 tools are preserved; suite stays green (261 unit + 72
  e2e).
- **Brand & UI overhaul.** Renamed the product to **toolkit** (working name)
  with a hand-drawn glasses logo (recreated as inline SVG from the source
  doodle). New sticky, responsive header with the logo, quick links, a
  **light/dark theme toggle** (manual override persisted in `localStorage`,
  with a no-flash init script and `data-theme` beating `prefers-color-scheme`),
  and a **mobile menu drawer** that lists every category. The home page gained a
  **browse-by-category** chip row (filter by category) and a wider layout, and
  every native control (select, color/range/checkbox/file inputs) now shares a
  consistent themed style via global CSS.

### Added

- **Productivity, image & PDF tools (zero-dependency batch):**
  - **Kanban board** (`/kanban`) — a lightweight board (To do / In progress /
    Done) saved in `localStorage`; add cards and move them between columns.
  - **Screenshot beautifier** (`/screenshot`) — frame a screenshot with a
    background (solid/gradient presets), padding, rounded corners and a shadow,
    then export a PNG. Live preview + canvas compositing.
  - **Images to PDF** (`/images-to-pdf`) — combine images into a single PDF
    (one per page) via a dependency-free PDF writer that embeds JPEGs with
    `/DCTDecode`; reorder and remove before export.
- **Color tools (zero-dependency batch):**
  - **Palette generator** (`/palette`) — complementary, analogous, triadic,
    tetradic and monochromatic harmonies plus tints/shades; click to copy.
  - **Gradient generator** (`/gradient`) — linear/radial CSS gradients with
    multiple stops, angle control, and copyable CSS.
  - **Color mixer** (`/color-mixer`) — blend two colors into N steps.
  - **Blob generator** (`/blob`) — organic SVG blob shapes (seeded, adjustable
    points/randomness) with SVG download/copy.
  - **Color theme maker** (`/theme-maker`) — build a matching light & dark
    theme from one accent and export CSS variables, with live UI mockups.
  - **Palette from image** (`/image-palette`) — extract a dominant-color
    palette from an image (downscaled canvas sampling + frequency ranking);
    nothing is uploaded.
  - **Color blindness simulator** (`/color-blindness`) — preview a set of
    colors under protanopia/deuteranopia/tritanopia/achromatopsia.
  - **Color name finder** (`/color-name`) — nearest CSS named color for a hex.
- **Encoders & text transforms (zero-dependency batch):**
  - **URL encode/decode** (`/url-encode`) — percent-encode and decode URL
    components, with a clear error for malformed input.
  - **HTML entities** (`/html-entities`) — escape the five HTML-significant
    characters and unescape named + numeric entities.
  - **Number base converter** (`/number-base`) — convert between binary, octal,
    decimal and hex; BigInt-backed so large values stay exact.
  - **Case converter** (`/case-converter`) — transform text between camelCase,
    snake_case, kebab-case, Title Case, CONSTANT_CASE and more.
  - **Line tools** (`/line-tools`) — sort, de-duplicate, reverse, shuffle, trim
    and clean lines, with live line stats.
  - Encode/decode tools now share an `EncodeDecodeTool` component.
- **Crypto tools (zero-dependency, Web Crypto):**
  - **Text encrypt/decrypt** (`/encrypt`) — password-based AES-256-GCM with a
    PBKDF2-derived key and random salt/IV; wrong passwords fail clearly.
  - **TOTP / 2FA generator** (`/totp`) — RFC 6238 codes from a base32 secret,
    with a live countdown (verified against the RFC test vectors).
  - **HMAC generator** (`/hmac`) — keyed HMAC (SHA-1/256/384/512) of a message.
- **Converters & calculators (zero-dependency batch):**
  - **Unit converter** (`/unit-converter`) — length, weight, data, time and
    temperature (temperature special-cased).
  - **Percentage calculator** (`/percentage`) — percent-of, what-percent,
    percent change, and tip/split.
  - **Unix timestamp converter** (`/timestamp`) — epoch ↔ ISO/UTC/local with a
    live clock and relative time.
  - **CSV ↔ JSON** (`/csv-json`) — convert both directions with an RFC 4180-ish
    quoted-field parser.
- **Text & design tools (zero-dependency batch):**
  - **Word & character counter** (`/word-count`) — words, characters,
    sentences, paragraphs, lines and reading time.
  - **Slugify** (`/slugify`) — URL slugs with diacritic stripping and a choice
    of separator/case.
  - **Color contrast checker** (`/contrast`) — WCAG AA/AAA pass/fail with a
    live preview and contrast ratio.
- **First tools with a dependency (Tier 2):**
  - **QR code generator** (`/qr`) — encode any link/text to a QR PNG with a
    download, via the `qrcode` library.
  - **Markdown editor** (`/markdown`) — live split-pane preview via
    `markdown-it`, configured with `html:false` so it is XSS-safe.
  - Note: a YAML↔JSON converter was deferred — the only `js-yaml` version the
    registry offered here was an anomalous `5.2.2` (real latest is 4.x) flagged
    with a critical advisory, so the package was not adopted.
- **Command-palette search:** the home-page search is now a keyboard-driven
  command palette (inspired by DevToys / free-tooling). It searches tool names,
  descriptions, categories and action-style keywords (e.g. "encode" → Base64,
  "minify" → JSON, "pomodoro" → Focus timer), shows results as rows with a
  category icon and tag, supports ↑/↓ + Enter navigation and a global ⌘K/Ctrl-K
  shortcut, and falls back to the grouped browse cards when the box is empty.
- **Tool hub (ADR-008):** the product is now a general-purpose, free,
  client-side browser tool hub. A registry-driven catalog
  (`src/tools/registry.ts`) is the single source of truth for ~35 tools; the
  home page (`/`) renders them grouped by category with live search, links the
  live ones (Compress, Crop, UUID) and shows the rest as "Soon".
- **UUID generator:** new `/uuid` tool — generate up to 100 random v4 UUIDs in
  the browser, adjust the count, and copy them. First tool shipped under the
  hub model.
- **Base64 encode / decode:** new `/base64` tool — UTF-8-safe Base64 encoding
  and decoding with a clear per-input error for invalid Base64.
- **Password generator:** new `/password` tool — cryptographically random
  passwords (CSPRNG, rejection-sampled to avoid modulo bias) with adjustable
  length and character sets.
- **Lorem Ipsum generator:** new `/lorem-ipsum` tool — generate up to 50
  paragraphs of placeholder text with the classic opening.
- **JSON formatter & validator:** new `/json` tool — format, minify and
  validate JSON with friendly error messages, all in the browser.
- **Hash generator:** new `/hash` tool — SHA-1/256/384/512 digests of text via
  Web Crypto (MD5 intentionally omitted).
- **JWT decoder:** new `/jwt` tool — decode and inspect a JSON Web Token's
  header and payload locally (no signature verification).
- **Regex tester:** new `/regex` tool — test a regular expression with flags
  against sample text, listing matches, positions and capture groups.
- **Color converter:** new `/colors` tool — pick a color and convert between
  HEX, RGB and HSL.
- **Text diff:** new `/text-diff` tool — compare two texts with an LCS line
  diff, highlighting added and removed lines with a change summary.
- **Notepad calculator:** new `/calculator` tool — evaluate arithmetic line by
  line with a safe expression evaluator (no `eval`), plus a running total.
- **Focus timer:** new `/focus-timer` tool — a simple Pomodoro timer (25/5)
  that alternates focus and break phases in the browser.
- **Resize image:** new `/resize` tool — set exact pixel dimensions with an
  optional aspect-ratio lock and choice of output format (PNG/JPG/WebP).
- **Convert image:** new `/convert` tool — convert between JPG, PNG and WebP,
  with a quality control for the lossy formats.
- **Rotate & flip:** new `/rotate` tool — rotate in 90° steps and flip
  horizontally/vertically, then download.
- **Shared image workspace:** resize/convert/rotate share a common
  drop-in/paste/preview shell (`ImageToolShell`) and canvas helpers
  (`src/lib/image.ts`), accepting JPG, PNG, WebP, GIF and BMP.
- **File checksum verifier:** new `/checksum` tool — compute a file's SHA
  digest in the browser and compare it against an expected checksum.
- **Metadata cleaner:** new `/metadata-cleaner` tool — strip EXIF/GPS and
  other embedded metadata by re-encoding the image through a canvas.
- **Favicon generator:** new `/favicon` tool — render an image to square PNG
  icons at multiple sizes and download them as a ZIP.
- **App navigation:** a persistent header links the tools (Optimize, Crop) and
  home, highlighting the current tool, so users move between them from anywhere.
- **Image Cropper (foundation):** new `/crop` tool — load a JPEG (picker /
  drag-drop / paste), frame it with an interactive crop box (drag to move,
  corner handles to resize, arrow keys to nudge), see live output dimensions,
  and download the cropped JPEG. Browser-only, single image. Second consumer of
  the shared UI primitives (#21, spec: `docs/tools/image-cropper-spec.md`).
- **Cropper aspect-ratio presets:** Free, 1:1, 4:5, 4:3, 16:9 — selecting a
  ratio re-fits the crop and constrains resizing to it (#22).
- **Cropper export size:** choose the output's longest edge (Original / 2048 /
  1600 / 1024 / 512 px) to produce a marketplace-ready size on download.
- **Cropper zoom:** magnify the workspace (1× / 1.5× / 2× / 3×) in a scrollable
  viewport for precise crops on large images; crop output is unaffected.
- **Clipboard paste:** paste an image anywhere on `/optimize` (Cmd/Ctrl+V) to
  add it to the queue, same as dropping or picking a file. Non-image content is
  ignored; pasted non-JPEGs get the normal per-file error (#18).
- **Download all as ZIP:** when a batch has 2+ optimized images, a single
  "Download all as ZIP" action packages them in the browser (via `fflate`,
  stored not re-compressed) with de-duplicated filenames — no upload (#8,
  ADR-007).
- **Remember last-used optimizer settings:** the chosen compression level is
  saved to `localStorage` and restored on return. Privacy-safe (setting only,
  never image data) and defensive against disabled/private-mode storage (#9).
- **Component architecture + CSS-in-JS styling (Emotion):** reusable, themed UI
  primitives (`Button`, `Stack`, `Card`, `Text`, `Page`, `Heading`,
  `VisuallyHidden`) under `src/components/ui/`, a typed theme with light/dark
  tokens, and an App Router SSR registry. Removed `app/globals.css`; the
  optimizer UI is now composed from styled components (ADR-006, #13).
- **Optimizer compression control:** choose Low / Balanced / High quality on
  `/optimize`; changing the level re-optimizes the current image and updates the
  size saved. Balanced remains the default, so the fast path is unchanged (#6).
- **Optimizer batch:** add and optimize multiple JPEGs in one session. A queue
  shows each file's preview, dimensions, size, and % saved, with per-file remove
  and retry, an overall batch summary, and per-file error handling so one bad
  file never breaks the batch. Quality applies across the whole queue (#7).
- Initial Project OS documentation structure
- Product vision and MVP boundaries
- AI agent operating instructions
- Image tools overview
- UX principles
- Architecture Decision Record process
- GitHub issue and pull-request templates
- **Sprint 001 — Image Optimizer foundation:** `apps/web` bootstrapped with
  Next.js (App Router) and strict TypeScript, plus ESLint, Prettier, Vitest,
  and Playwright.
- `/optimize` route with the first vertical slice: add one JPEG (file picker or
  drag-and-drop), validate it, preview it with filename/dimensions/format/size,
  optimize it locally in the browser at one balanced default, see output size
  and percentage saved, and download the result.
- Clear error handling for unsupported and corrupt files, and cleanup of object
  URLs and temporary resources.
- Unit tests for validation, filename generation, size math, and formatting;
  browser tests for the optimize-and-download flow and failure handling.
- `docs/sprints/sprint-001-foundation.md` sprint definition.
- **Issue-driven project workflow:** canonical label set (`.github/labels.yml`)
  with a `label-sync` workflow, CI workflow (guarded on `apps/web`),
  `agent:ready` readiness-validation workflow, and an optional PR→Project status
  workflow.
- Project-management docs: `agent-workflow.md` (agent operating rules and the
  `agent:ready` gate), `issue-lifecycle.md` (state model), and
  `github-project-setup.md` (one-time board/field/view/automation setup).
- Issue forms updated to the `type:*` label scheme; the feature form now
  captures Dependencies and Definition of done.

### Decisions

- Build reliable standalone tools before connecting them into workflows
- Keep project setup skippable
- Support both quick one-off use and later project-aware processing
- Include image cropping as a core tool
- Defer broad AI features until after the core tools are proven
- **Optimize JPEGs client-side with the Canvas API** (ADR-005): browser-local,
  zero image-processing dependencies. Evidence: a 609 KB fixture re-encoded to
  232 KB (61.8% smaller) at the balanced default.
- GitHub is the source of truth for work; a coding agent runs a label-gated,
  issue-driven loop and starts work only on `agent:ready` issues (owner-gated).
