# Roadmap

This roadmap describes direction, not fixed deadlines.

## Tool catalog (ADR-008)

The product is a general-purpose, free, client-side **browser tool hub**: many
small tools under one roof, every one running locally with no account, no
upload, and no paywall. The catalog is registry-driven
(`apps/web/src/tools/registry.ts`) — the home page, search, and navigation all
read from a single source of truth, and shipping a tool means adding a route +
component and flipping its `status` from `planned` to `live`.

Tools are drawn from UX research of existing browser-tool suites. Build order favours
small, pure, high-value utilities first; heavy tools (PDF/video editors, AI
upscale) come later.

**48 tools are live** (see `docs/PROJECT-STATE.md` for the full table and the
recipe for adding one). The home-page search is a keyboard-driven **command
palette** (icons, category tags, action keywords, ⌘K, ↑/↓ + Enter).

- [x] Registry + catalog landing page (`/`)
- [x] Command-palette search (keywords, keyboard nav, ⌘K)
- [x] Images & Media (8) — Compress, Crop, Resize, Convert, Rotate/Flip, QR, Favicon, Screenshot beautifier
- [x] Text & Documents (7) — Markdown, Text diff, Lorem Ipsum, Case converter, Line tools, Word counter, Slugify
- [x] Developer (15) — UUID, Base64, Password, JSON, Hash, JWT, Regex, Checksum, URL encode, HTML entities, Number base, TOTP/2FA, HMAC, Timestamp, CSV↔JSON
- [x] Design (10) — Colors, Contrast, Palette, Gradient, Color mixer, Blob, Theme maker, Palette-from-image, Color-blindness, Color name finder
- [x] PDF (1) — Images to PDF
- [x] Privacy (2) — Metadata cleaner, Text encrypt/decrypt (AES)
- [x] Productivity (2) — Focus timer, Kanban board
- [x] Calculators (3) — Notepad calculator, Unit converter, Percentage

Remaining backlog (need a dependency, are heavy, or are policy-deferred):

- [ ] Needs a library — Mermaid, Markdown+Mermaid, Code image, JSON↔YAML (deferred)
- [ ] Heavier custom builds — Image editor, PDF editor / redact, Video editor,
      Text-to-handwriting, Diagram builder
- [ ] Policy / AI deferred — Upscale (#27), Remove watermark (#28)

Every tool in the registry is a candidate; the sections below track the
image-focused ones in more detail.

## Phase 0 — Product foundation

- [x] Define the standalone-tools-first strategy
- [x] Make project setup optional
- [x] Include image cropping as a core utility
- [x] Establish repository documentation structure
- [ ] Define product naming and visual direction
- [x] Define the first implementation stack (Next.js + strict TypeScript; ADR-005 — Sprint 001)
- [ ] Create the initial GitHub Project board
- [ ] Create MVP issues and labels

## Phase 1 — Image Optimizer MVP

Goal: users can optimize one or many product images with minimal effort.

Sprint 001 delivered a deliberately narrow first slice: **one JPEG in, one
optimized JPEG out**, in the browser. Items below marked "(JPEG slice)" are done
for that slice only; full multi-format, batch, and controls remain open. See
`docs/sprints/sprint-001-foundation.md`.

- [x] Drag-and-drop upload (JPEG slice)
- [x] File picker (JPEG slice)
- [x] Clipboard paste
- [x] Multiple-image queue
- [x] Compression controls
- [x] Before/after size comparison (JPEG slice)
- [x] Download single output (JPEG slice)
- [x] Download all as ZIP
- [x] Responsive interface (JPEG slice)
- [x] Error and unsupported-file handling (JPEG slice)
- [x] Privacy explanation for client-side processing (JPEG slice)

## Phase 2 — Core standalone image tools

### Image Cropper

- [x] Free crop (foundation — `/crop`, move + resize, export)
- [x] Common aspect ratios (Free, 1:1, 4:5, 4:3, 16:9)
- [ ] Ecommerce presets (marketplace pixel sizes)
- [x] Reposition and zoom
- [x] Export settings (output longest-edge size)
- [ ] Batch workflow exploration

### Image Converter

- [ ] PNG, JPEG, WebP and AVIF support where practical
- [ ] Quality controls
- [ ] Transparency warnings
- [ ] Batch conversion

### Image Resizer

- [ ] Exact dimensions
- [ ] Max width or height
- [ ] Preserve aspect ratio
- [ ] Common marketplace presets
- [ ] Batch resize

### Image Rotate / Flip

Added after UX research of existing image-tool suites.
Client-side via Canvas; no new dependencies (ADR-005).

- [ ] Rotate 90° left / right
- [ ] Arbitrary-angle rotation
- [ ] Horizontal / vertical flip
- [ ] Batch rotate/flip
- [ ] Export settings shared with the other tools

## Phase 3 — Shared foundations

- [ ] Shared file queue
- [ ] Shared export settings
- [ ] Reusable preview component
- [ ] Preset system
- [ ] Local preference persistence
- [ ] Accessible keyboard workflows
- [ ] Performance telemetry without collecting user images
- [ ] **Unified "My Images" workspace** — one place to add images, then route
      them into any tool (bridges Phase 4). Pulled forward from the UX
      scan; the shared file queue is its foundation.

## Phase 4 — Project workflows

- [ ] Optional projects
- [ ] Project-specific image rules
- [ ] Saved presets
- [ ] Process images according to project settings
- [ ] Combine crop, resize, convert and optimize
- [ ] Re-run workflows consistently

## Phase 5 — AI-assisted features

- [ ] Image generation entry point
- [ ] Project-aware image prompts
- [ ] Background replacement or cleanup
- [ ] Product-image quality checks
- [ ] Listing-related helpers
- [ ] **Upscale image** — real quality needs AI super-resolution (heavy WASM or
      a paid/hosted model), which conflicts with our no-backend / privacy-local
      MVP stance. Approach is an **open owner decision**; a naive Canvas
      "upscale" (interpolation only) is not worth shipping.
- [ ] **Remove Watermark** — ⚠️ **legal/ethical: needs an explicit owner policy
      decision before any work.** Dual-use (removing your own vs. others'
      watermarks); a general remover would mostly enable copyright infringement
      and needs AI inpainting. If pursued, scope strictly to the user's *own*
      watermark with clear ownership guidance. Not in the near-term plan.

AI features must not delay the core utility MVP.
