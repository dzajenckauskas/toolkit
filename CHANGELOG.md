# Changelog

Meaningful product, architecture, workflow, and scope changes are recorded here.

## Unreleased

### Added

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
