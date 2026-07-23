# Image Cropper — Specification

- Status: Draft (for owner review)
- Date: 2026-07-23
- Related: ADR-003 (cropping is a core tool), ADR-005 (client-side Canvas),
  ADR-006 (component architecture), `docs/tools/image-tools-overview.md`,
  `docs/ux/design-principles.md`

## Context

The Image Optimizer MVP is complete. The Cropper is the second core standalone
tool (ADR-003) and lives at `/crop`. It is also the **concrete second use case**
that justifies extracting shared UI into `packages/ui` (ADR-001/006).

This spec defines a deliberately narrow first Cropper so we can ship and learn,
mirroring how the optimizer started (one clear slice, browser-only, no accounts).

## User outcome

Frame a product image to the right crop and aspect ratio for a storefront or
marketplace, then download the cropped result — entirely in the browser.

## In scope (Cropper MVP)

- `/crop` route, one image at a time to start.
- Load a JPEG (file picker, drag-and-drop, paste — reuse the optimizer's input).
- Interactive crop rectangle over a preview: move and resize handles.
- **Aspect-ratio presets** plus free-form:
  - Free
  - Square 1:1
  - Portrait 4:5
  - Landscape 4:3
  - Widescreen 16:9
- Live readout of the output pixel dimensions.
- Export the cropped area as a JPEG (reuse the Canvas encode + balanced quality
  from the optimizer) and download it.
- Responsive, accessible, browser-only (no upload), consistent with the
  optimizer's look via shared primitives.

## Out of scope (first slice)

- Batch cropping (one image first; batch is a later slice).
- Rotation / straightening (ADR-003 says "if justified" — deferred pending a
  real need; see open decisions).
- Zoom-beyond-100% / upscaling.
- PNG/WebP (JPEG only, same as the optimizer today).
- Saving presets / project rules (post-MVP, project workflows).
- Combining crop + optimize in one pass (that's the later connected workflow).

## Controls

- Drag inside the crop box to reposition; drag handles to resize.
- Aspect-ratio selector (reuses the styled radio-card pattern from the
  optimizer's quality control).
- Optional numeric width/height for exact output (later slice; free/preset
  first).
- Keyboard: arrow keys nudge the crop; handles are focusable and operable.

## Ecommerce presets

The four ratios above cover the common marketplace needs (square listings,
4:5 portrait for feeds, 4:3/16:9 for banners). Marketplace-specific pixel
presets (e.g. exact required dimensions) are a later enhancement once we see
which platforms users target.

## Output data (per crop)

- Source filename, source dimensions.
- Crop rectangle (x, y, w, h) in source pixels.
- Output dimensions and file size.
- Download name: `name-cropped.jpg` (mirrors the optimizer's suffix helper).

## UX flow (per `design-principles.md`)

1. Add an image (picker / drop / paste).
2. See it with a crop box and the aspect-ratio options.
3. Adjust the crop (drag/resize or pick a ratio).
4. See the output dimensions update live.
5. Download.

Mobile stays a clear vertical sequence; the primary download action is never
hidden; errors follow the same clear per-file pattern as the optimizer.

## Technical approach

- Client-side Canvas, consistent with ADR-005: draw the selected source
  rectangle into a canvas of the output size, then `canvas.toBlob('image/jpeg', quality)`.
- Pure, testable helpers (mirroring the optimizer's `src/lib`):
  - crop-rectangle math (clamp to bounds, apply aspect ratio, map
    preview-space ↔ source-space coordinates),
  - output filename (reuse/extend `filename.ts`),
  - dimension/size formatting (reuse `format.ts`).
- The interactive crop overlay is the main new UI; encode/validation reuse
  existing optimizer libs where sensible (without premature over-sharing).

## The `packages/ui` extraction (ADR-001/006)

The Cropper is the **second use case** for the shared primitives (`Button`,
`Stack`, `Text`, `Card`, the radio-card control, the dropzone, the theme). Per
ADR-001, we now have justification to extract `apps/web/src/components/ui/` and
`src/theme/` into `packages/ui`. Recommended sequence:

1. Land the Cropper foundation reusing the primitives **in place** (proves the
   second consumer).
2. Extract `packages/ui` with a proper `exports` map, per-component entry
   points, and `sideEffects` for tree-shaking; point both `/optimize` and
   `/crop` at it. Record as its own ADR.

Doing the extraction *after* the second consumer exists (not before) keeps us
honest to ADR-001.

## Open decisions for the owner

1. **Rotation/straighten** in the Cropper MVP, or defer? (Recommend: defer.)
2. **Preset list** — are the four ratios right, or add marketplace pixel presets
   now? (Recommend: four ratios now.)
3. **`packages/ui` timing** — extract as part of the Cropper foundation, or as a
   dedicated follow-up right after? (Recommend: foundation first, then extract.)
4. **Single vs. batch** for the first Cropper slice. (Recommend: single first.)

## Proposed work (to become Inbox issues; none `agent:ready` until approved)

- **Epic: Image Cropper MVP** — tracking.
- **Cropper foundation** — `/crop`, load one JPEG, free-crop overlay, export +
  download; crop-math unit tests + a browser test.
- **Aspect-ratio presets** — 1:1 / 4:5 / 4:3 / 16:9 + free.
- **Extract `packages/ui`** — once the foundation proves the second consumer.

## Definition of done (Cropper MVP)

Users can load a JPEG, choose a ratio or free-crop, see live output dimensions,
and download the cropped JPEG — responsive, accessible, browser-only — with the
same quality bar (tests, docs, error states) as the optimizer.
