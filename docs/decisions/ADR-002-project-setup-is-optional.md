# ADR-002: Project setup is optional

- Status: Accepted
- Date: 2026-07-23

## Context

Some users need a quick one-off utility. Others will eventually want repeatable settings for a store, client, or marketplace.

Requiring project creation would add friction to simple tasks.

## Decision

Every standalone tool must work without a project.

Projects may later provide saved presets, naming rules, connected tools, and repeated processing. Users can choose to process an image casually or within project settings.

## Consequences

### Positive

- Immediate value for new and occasional users
- No mandatory onboarding
- Easier sharing and search-driven acquisition
- Projects represent added value rather than a gate

### Negative

- The interface must support both temporary and project-aware state
- Some settings may need migration when a user creates a project later
