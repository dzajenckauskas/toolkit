# ADR-005: Optimize JPEGs client-side with the Canvas API

- Status: Accepted
- Date: 2026-07-23

## Context

Sprint 001 ships the first Image Optimizer slice: one JPEG in, one optimized
JPEG out. A processing approach was needed that:

- runs in the browser, to honor the privacy principle ("prefer
  privacy-preserving local processing", AGENTS.md / ADR direction) and avoid
  building any backend in the MVP;
- adds minimal dependencies and complexity (ADR-001: avoid speculative
  abstraction; no shared packages without a second use case);
- is maintainable by the project owner;
- is good enough to prove the value of the tool for a first slice.

This ADR was proposed at the start of the sprint and is resolved here with
evidence from the implementation.

## Decision

Optimize JPEGs entirely in the browser by re-encoding through the Canvas API:
decode the file into an `HTMLImageElement`, draw it to a `<canvas>`, and export
with `canvas.toBlob('image/jpeg', quality)` at a single balanced quality
(`0.8`). No network calls, no server, no image-processing libraries.

**Status: Accepted** — the approach met the sprint's needs with real evidence
(below). It is deliberately the smallest reversible option; ADR-006 can replace
the encoder later without changing the product surface.

## Evidence

- On a representative 900×700 detailed JPEG fixture, re-encoding at quality
  `0.8` reduced the file from **609,175 → 232,521 bytes (61.8% smaller)**.
- Fully client-side: verified by Playwright driving the real browser; no
  network request carries image data.
- Zero image-processing dependencies added.
- Decode failures (corrupt or non-JPEG data) surface as a clear, catchable
  error rather than a broken output.

## Consequences

### Positive

- No backend, no upload, no per-image cost; strong privacy story.
- Tiny dependency surface; easy to maintain and reason about.
- Works in all evergreen browsers with the standard Canvas API.

### Negative / limitations (documented for users and future work)

- **Metadata is dropped.** Canvas re-encoding discards EXIF (orientation, GPS,
  color profile). Acceptable — often desirable — for ecommerce web images, but
  it must not be presented as lossless.
- **Generational quality loss.** Re-encoding an already-lossy JPEG at `0.8`
  loses some quality; the UI never implies quality is unchanged.
- **Already-optimized inputs can grow.** A small, heavily-compressed source may
  come out larger. The UI reports the real result honestly, including an
  "already well optimized — no size reduction" state instead of a fake saving.
- **No quality control yet.** One balanced default only; a slider is a
  follow-up if users ask for it (MVP "desirable if low-risk" list).
- **Large-image memory limits**, especially on Mobile Safari, where very large
  canvases can be down-scaled or fail. Not exercised in this environment; a
  size cap (25 MB) is enforced up front and the risk is flagged as unverified.

## Alternatives considered

### WASM encoder (e.g. mozjpeg via `@jsquash/jpeg`)

Better compression control and quality, but adds a WASM dependency, bundle
weight, and complexity not justified for a first slice. Revisit if canvas
quality/ratio proves insufficient.

### `browser-image-compression` library

Convenient, but pulls in a dependency for something the platform already does.
Rejected to keep the surface minimal for the first slice.

### Server-side processing (e.g. sharp)

Best quality and format control, but requires a backend, uploads, and cost —
explicitly out of MVP scope and against the privacy direction.
