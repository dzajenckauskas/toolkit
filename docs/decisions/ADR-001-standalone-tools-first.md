# ADR-001: Build standalone tools before connected workflows

- Status: Accepted
- Date: 2026-07-23

## Context

The product concept includes multiple image utilities, project settings, repeatable workflows, and AI-assisted features. Building the full connected system immediately would increase complexity before the quality and demand for each core operation are understood.

## Decision

Build and validate reliable standalone image tools first.

The first implementation focus is the Image Optimizer. Cropper, Converter, and Resizer follow as independent tools. Connected project workflows are introduced only after the standalone tools reveal stable shared requirements.

## Consequences

### Positive

- Faster route to a usable product
- Smaller implementation and UX scope
- Easier testing and debugging
- Real usage can guide shared architecture
- Each tool can attract users independently

### Negative

- Some components may be refactored later
- Early users cannot create complete automated workflows
- Shared behavior may initially vary slightly between tools

## Alternatives considered

### Build the complete workflow platform first

Rejected because it requires speculative abstractions and delays validation.

### Build all tools simultaneously

Rejected because it spreads effort and makes it harder to achieve excellent quality in the first release.
