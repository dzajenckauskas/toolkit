# Changelog

Meaningful product, architecture, workflow, and scope changes are recorded here.

## Unreleased

### Added

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

### Decisions

- Build reliable standalone tools before connecting them into workflows
- Keep project setup skippable
- Support both quick one-off use and later project-aware processing
- Include image cropping as a core tool
- Defer broad AI features until after the core tools are proven
- **Optimize JPEGs client-side with the Canvas API** (ADR-005): browser-local,
  zero image-processing dependencies. Evidence: a 609 KB fixture re-encoded to
  232 KB (61.8% smaller) at the balanced default.
