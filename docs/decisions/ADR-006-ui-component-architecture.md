# ADR-006: Component architecture and CSS-in-JS styling

- Status: Accepted
- Date: 2026-07-23

## Context

Styling was accumulating in a single growing `app/globals.css`, and UI lived as
large inline JSX. That does not scale, is not reusable, and will only get worse
as the Cropper, Converter, and Resizer arrive. We need styled, reusable
components and organized, tree-shakeable dependencies — decided deliberately
before more tools are built.

Two separable questions:

1. **How do we style and structure components?**
2. **When do we extract shared UI into a `packages/ui` package?**

ADR-001 says: build standalone tools first and *"reuse shared foundations only
after a concrete second use case exists; avoid speculative abstraction."* That
constrains question 2 but not question 1.

## Decision

### Styling: CSS-in-JS with Emotion

Use **Emotion** (`@emotion/react` + `@emotion/styled`) — the MUI-style
`styled('el')(({ theme }) => ({ … }))` API — with a typed theme for design
tokens. Colors are exposed as CSS custom properties (with a light/dark
`prefers-color-scheme` block in a single Emotion `<Global>`), so dark mode needs
zero JavaScript; the typed `theme` object gives styled components ergonomic
access. `app/globals.css` is removed.

Emotion is a good fit **here specifically** because the tool is entirely
client-side (the optimizer is a `'use client'` component doing canvas work), so
Emotion's main drawback — runtime cost / RSC incompatibility — barely applies.
Server components (the page shells) render client primitives at their boundary.
SSR is handled by an App Router registry (`useServerInsertedHTML`) so first
paint is styled with no FOUC.

### Visual tokens: restrained corner radii

Use a compact radius scale: 6px for small elements, 8px for standard controls,
12px for cards and panels, and 16px only for the largest feature surfaces.
Buttons and category chips remain fully rounded pills so actions stay visually
distinct from text-entry controls. Square icon buttons declare `50%` explicitly
to remain circular. This keeps inputs and surfaces visually precise without
flattening interactive controls.

### Component structure: shared package after demonstrated reuse

Reusable primitives live in `packages/ui` and feature components compose them.
Extraction happened after the Cropper and subsequent tools provided concrete
second use cases, satisfying ADR-001. Add a primitive only after repeated use
establishes a stable contract; feature-specific surfaces stay with the feature.
The package keeps a pure re-export barrel, no side-effectful modules, and a
theme that is importable on its own.

## Consequences

### Positive

- No monolithic global stylesheet; styles are co-located with components.
- Reusable, themed primitives; consistent look with little effort.
- Typed theme → autocomplete and safety for design tokens.
- Automatic dark mode via CSS variables, no JS theme switching.
- Honors ADR-001 (no premature package) while still being "correct from the start".

### Negative / trade-offs

- Emotion adds a small client runtime. Acceptable because the app is
  client-side; revisit if we ever add heavy Server-Component-only surfaces.
- Emotion styled components must live in client components (`'use client'`).
- One extra concept (the SSR registry) to maintain.

## Alternatives considered

- **CSS Modules** — zero runtime, RSC-native, but the owner prefers the
  MUI-style CSS-in-JS authoring model.
- **Tailwind** — great tree-shaking, but a different paradigm than requested.
- **vanilla-extract / PandaCSS** — zero-runtime CSS-in-JS with a similar feel
  and better performance/tree-shaking; the strongest future alternative if the
  Emotion runtime ever becomes a concern. PandaCSS in particular could replace
  Emotion with a comparable `styled` API and no runtime.
- **MUI (the component library)** — too heavy and opinionated for a lean image
  tool, and a large dependency; we adopt its *styling engine* (Emotion), not the
  component set.

## Follow-up

Continue moving only demonstrated repeated contracts into `packages/ui`.
Keep semantic feature controls, such as colour swatches and image previews,
local even when they happen to use the same HTML element.
