# Roadmap

This roadmap describes direction, not fixed deadlines.

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

- [ ] Free crop
- [ ] Common aspect ratios
- [ ] Ecommerce presets
- [ ] Reposition and zoom
- [ ] Export settings
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

## Phase 3 — Shared foundations

- [ ] Shared file queue
- [ ] Shared export settings
- [ ] Reusable preview component
- [ ] Preset system
- [ ] Local preference persistence
- [ ] Accessible keyboard workflows
- [ ] Performance telemetry without collecting user images

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

AI features must not delay the core utility MVP.
