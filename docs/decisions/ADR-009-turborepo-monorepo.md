# ADR-009: Adopt a Turborepo monorepo; reject Module Federation micro-frontends

- Status: Accepted
- Date: 2026-07-28

## Context

The product grew from a single Next.js app into a hub of ~50 tools (ADR-008).
The UI primitives, the pure per-tool logic, and the tool registry had all
accumulated inside `apps/web`, so the boundaries the code implied were not
enforced by anything — any file could import any other.

Two shapes were on the table:

1. **A package-split monorepo** — one app, plus workspace packages for the parts
   that are genuinely shared, with a task runner for caching.
2. **Micro-frontends** — a shell app plus one app per tool category (images,
   design, developer…), composed at runtime with **Module Federation** (a
   pattern used elsewhere in the author's work).

## Decision

Adopt option 1: a **Turborepo + npm-workspaces monorepo** with a single Next.js
app and small, focused packages. **Reject Module Federation.**

```
apps/web                     # the shell + every tool route (Next.js App Router)
packages/ui                  # Emotion theme + UI primitives (ADR-006)
packages/lib                 # framework-agnostic client-side tool logic
packages/tools               # the tool registry + landing content (ADR-008)
packages/typescript-config   # shared tsconfig presets
```

Packages are consumed from source via Next's `transpilePackages` (no separate
build step); Turbo runs `build` / `lint` / `typecheck` / `test` across the graph
with caching.

## Why not Module Federation

Module Federation solves a specific problem: **independently deployed
applications, owned by different teams, composed at runtime.** None of that is
true here — one maintainer, one deployment, one cohesive product. Applying it
anyway would cost more than it returns:

- **It fights the stack.** The app is Next.js App Router + React 19 (RSC). MF's
  Next integration has always centred on the Pages Router; RSC/streaming support
  is experimental. We would either abandon the App Router (losing SSG, metadata,
  and the SEO work) or fight a brittle integration.
- **No upside for a client-side app.** Next already code-splits per route, so
  visiting `/crop` never ships the design tools' JavaScript. MF would add a
  runtime shell fetching remotes over the network to re-solve a problem the
  bundler already solves at build time.
- **More failure modes.** Version skew between shell and remotes, shared-
  dependency singletons (React!), and independently-deployed remotes drifting out
  of sync are real operational costs a solo project should not take on.
- **Right-sizing over resume-driven complexity.** A clean package split with
  compiler-enforced boundaries demonstrates the same monorepo competence without
  the fragility.

If a micro-frontend demonstration is ever wanted, it belongs in its own
purpose-built repo where MF is actually justified — not retrofitted onto a
cohesive product.

## Consequences

### Positive

- Boundaries are enforced by the compiler: `@toolkit/lib` cannot import app code.
- Turbo caches `build`/`lint`/`typecheck`/`test` across packages.
- Shared TypeScript/Prettier config keeps every package consistent.
- Each package is independently type-checked and unit-tested; the app is covered
  by Playwright e2e.

### Negative / watch-outs

- **Cross-platform lockfiles.** A single hoisted lockfile regenerated on macOS
  dropped the Linux native binaries for vitest's rollup/esbuild, breaking
  `npm ci` on CI. Fixed by declaring the linux-x64 binaries as root
  `optionalDependencies` (installed only on Linux). Worth remembering whenever
  the lockfile is regenerated off-Linux.
- **Deploy coupling.** Install/build moved from `apps/web` to the repo root;
  `deploy.sh` and CI were updated together, with `deploy.sh` made
  layout-detecting so the production transition needed no manual step.

## Relates

Builds on ADR-001 (standalone tools, avoid speculative abstraction), ADR-006
(shared UI package), and ADR-008 (the tool-hub pivot). Does not change the
client-side / privacy stance (ADR-005).
