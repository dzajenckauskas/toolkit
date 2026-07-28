# Image Tools Overview

## Product model

Each core image utility should work as a standalone route and share only proven common components.

Suggested routes:

- `/optimize`
- `/crop`
- `/convert`
- `/resize`
- `/rotate`

A later project workflow may combine these operations, but that is not required
initially. UX research of existing image-tool suites suggests
a future **unified "My Images" workspace** — add images once, then route them
into any tool — as the natural evolution of the shared file queue (Phase 3/4).

## Image Optimizer

### User outcome

Reduce image file size while keeping acceptable visual quality.

### Core controls

- Compression or quality level
- Output format when relevant
- Metadata behavior
- Batch processing

### Core output data

- Original filename
- Original and output format
- Original and output dimensions
- Original and output file size
- Percentage saved
- Error status

## Image Cropper

### User outcome

Create the correct framing and aspect ratio for a storefront or marketplace.

### Core controls

- Free crop
- Fixed aspect ratio
- Zoom
- Position
- Rotation if justified
- Export dimensions

### Useful presets

- Square 1:1
- Portrait 4:5
- Landscape 4:3
- Widescreen 16:9
- Custom dimensions

## Image Converter

### User outcome

Convert images into a compatible or more efficient format. Framed
bidirectionally for users ("to JPG" / "from JPG"), matching how people think
about conversions, over the supported format matrix below.

### Initial formats

- JPEG
- PNG
- WebP
- AVIF where browser support and output quality are dependable

### Important states

- Transparency loss warning
- Unsupported source format
- Animation loss warning
- Quality controls for lossy formats

## Image Resizer

### User outcome

Change image dimensions without manually calculating ratios.

### Core modes

- Exact width and height
- Width only
- Height only
- Fit within maximum dimensions
- Scale by percentage

### Required safety

- Preserve aspect ratio by default
- Warn about distortion
- Avoid accidental enlargement by default

## Image Rotate / Flip

Added from UX research of existing image-tool suites.

### User outcome

Straighten or reorient a product photo.

### Core controls

- Rotate 90° left / right
- Arbitrary-angle rotation (with a live preview)
- Horizontal / vertical flip
- Batch apply

### Approach

Client-side Canvas, no new dependencies (ADR-005). Arbitrary angles expand the
canvas to fit the rotated bounds; the fill for exposed corners (transparent vs.
a chosen color) is a small design decision.

## Post-MVP / AI utilities (Phase 5 — decisions required)

These appear on some existing tools but do **not** fit the current no-backend,
privacy-local, no-AI-in-MVP stance (ADR-004/005). Parked pending owner decisions.

### Upscale image

Real quality needs AI super-resolution (heavy in-browser WASM or a hosted/paid
model). A naive Canvas interpolation only stretches pixels and adds no detail —
not worth shipping as "upscale". **Open decision:** which approach, if any.

### Remove Watermark — ⚠️ policy decision required

Dual-use and legally sensitive: legitimate for the user's *own* watermark, but a
general remover mostly enables stripping others' copyrighted watermarks, and it
requires AI inpainting. **Do not build a general watermark remover.** If pursued,
scope strictly to the user's own watermark with explicit ownership guidance, and
only after the owner signs off on the policy.

## Later project workflows

A project could define:

- Required aspect ratio
- Required dimensions
- Preferred format
- Maximum file size
- Filename rules
- Background rules
- Compression quality

Users could then upload images and apply the complete ruleset consistently.
