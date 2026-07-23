# ADR-004: Defer broad AI features until after the core MVP

- Status: Accepted
- Date: 2026-07-23

## Context

AI image generation and project-aware prompt workflows may add significant value, but they also introduce provider dependencies, variable costs, moderation, latency, and more complex user expectations.

## Decision

Do not make broad AI features a dependency of the initial standalone image-tool MVP.

AI may be researched in parallel, but implementation priority remains the reliability and usability of the core image utilities.

## Consequences

- The initial product can be faster, cheaper, and easier to trust.
- Future AI work can build on validated project settings and image pipelines.
- The product must establish value without relying on AI novelty.
