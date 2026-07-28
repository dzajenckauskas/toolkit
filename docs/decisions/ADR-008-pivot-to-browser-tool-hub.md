# ADR-008: Expand into a free, private, in-browser tool hub

- Status: Accepted
- Date: 2026-07-24

## Context

The project began as a focused ecommerce image toolkit (ADR-001, `vision.md`).
Market/UX research of the browser-tool space — paywalled image-tool sites on one
end and free, client-side generalist tool suites on the other — showed a clear
opening: the strongest positioning in the category is *"no account, no paywall,
no nonsense — just a tool running in your browser,"* which is exactly the
direction we already lean toward, applied to a **broad** catalog of ~30
utilities.

The owner has decided to **build the full set of tools** the research surfaced
(image tools + developer/text/PDF/design/productivity utilities), as a personal
project, with monetization deferred.

## Decision

Broaden the product from a focused ecommerce image toolkit into a **general-
purpose, free, client-side browser tool hub**.

- **Everything stays client-side and free** — no account, no upload, no paywall
  (monetization to be decided later, separately).
- **Tools remain standalone** (the spirit of ADR-001) but there will be many
  more of them, organized by category.
- A **tool registry** (`src/tools/registry.ts`) is the single source of truth;
  a **catalog landing page with search** and category grouping is the entry
  point (a command-palette-style catalog, a familiar pattern for tool suites).
- The existing image tools (Optimizer, Cropper, and planned Resize/Convert/
  Rotate) remain a first-class category, not the whole product.

## Consequences

### Positive

- Much larger surface; each tool is small and independent, so incremental.
- Our architecture already fits: shared `ui` primitives, per-tool routes,
  client-side processing, a typed theme — the registry just scales it.
- Strong, honest positioning (free/private/in-browser) vs. paywalled alternatives.

### Negative / open

- **Product identity & name.** "Ecommerce Toolkit" no longer fits; a neutral
  name is an open decision (kept as-is in code for now to avoid churn).
- **Focus risk.** A 30-tool suite is harder to make each tool excellent; we
  mitigate by keeping tools small, standalone, and well-tested.
- Some tools are heavy (Video/PDF/Image editors, AI upscale, watermark removal);
  those stay later-stage and, where AI is required, still gated (ADR-004) and —
  for watermark removal — behind the policy flag (ADR-004).
- **Monetization** is explicitly deferred; nothing here commits to a model.

## Scope

The target catalog is enumerated in `ROADMAP.md` ("Tool catalog") and
`src/tools/registry.ts`. Build order favors small, pure, high-value tools first.

## Supersedes / relates

Broadens ADR-001 (still: standalone tools, avoid speculative abstraction) rather
than replacing it. Does not change ADR-004 (AI deferred) or the client-side /
privacy stance (ADR-005).
