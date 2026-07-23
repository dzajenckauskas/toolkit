# ADR-003: Image cropping is a core tool

- Status: Accepted
- Date: 2026-07-23

## Context

Ecommerce images frequently need reframing or a specific aspect ratio before resizing and optimization. Cropping is not merely an advanced workflow step; it is a common independent task.

## Decision

Include Image Cropper among the core standalone tools.

It follows the first Image Optimizer MVP unless research identifies a stronger reason to reorder the roadmap.

## Consequences

- Shared preview and export foundations should consider interactive cropping.
- Ecommerce and marketplace aspect-ratio presets become strategically useful.
- Connected workflows can later combine crop, resize, convert, and optimize.
