# Changelog

Meaningful product, architecture, workflow, and scope changes are recorded here.

## Unreleased

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
