# ADR-007: Use fflate for client-side ZIP packaging

- Status: Accepted
- Date: 2026-07-23

## Context

The Image Optimizer's MVP "Required" list includes "Download all results as a
ZIP" (`docs/product/mvp-scope.md`, #8). Batch already produces several optimized
JPEG blobs in the browser; users need a single "Download all" that packages them
into one ZIP. Per the privacy direction, this must happen client-side with no
upload. Adding a dependency is owner-gated (`docs/project-management/agent-workflow.md`);
the owner approved a small, well-maintained zip library.

## Decision

Use **[fflate](https://github.com/101arrowz/fflate)** for in-browser ZIP
creation.

- Package entries with `zipSync` at **compression level 0 (store)**: the
  payloads are already-compressed JPEGs, so deflate would burn CPU for no gain.
- Filenames are de-duplicated (`src/lib/zip.ts`) before zipping so two outputs
  with the same name can't overwrite each other.
- The ZIP bytes are wrapped in a `Blob` and downloaded via a temporary object
  URL; nothing is uploaded.

## Consequences

### Positive

- Very small footprint (~8 KB gzipped), zero dependencies, tree-shakeable, MIT.
- Fast; level-0 store is effectively a concatenation, so it stays responsive
  for the handful of images a batch holds.
- Pure and testable: `dedupeFilenames` and `buildZip` are unit-tested (the ZIP
  round-trips via `unzipSync`).
- Keeps the whole flow client-side, consistent with ADR-005.

### Negative / limitations

- One more runtime dependency (accepted, per owner approval).
- `zipSync` runs on the main thread. Acceptable at level 0 for batch-sized
  inputs; if very large batches ever cause jank, switch to fflate's async
  (worker-backed) `zip` API without changing the public surface.

## Alternatives considered

- **JSZip** — popular but larger (~100 KB) and heavier API; rejected for size.
- **client-zip** — tiny and streaming, but a stream-oriented API that fits a
  fetch/Response download better than our in-memory blobs; fflate's plain
  `Uint8Array` in/out was a simpler match here.
- **No library (hand-rolled ZIP)** — needless complexity and risk for a
  well-solved format.
