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

- GitHub is the source of truth for work; a coding agent runs a label-gated,
  issue-driven loop and starts work only on `agent:ready` issues (owner-gated)

- Build reliable standalone tools before connecting them into workflows
- Keep project setup skippable
- Support both quick one-off use and later project-aware processing
- Include image cropping as a core tool
- Defer broad AI features until after the core tools are proven
