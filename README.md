# toolkit

**Free, private, browser-based tools for everyday development and creative work.**
No account, no upload, no paywall — every tool runs entirely on your device.

🔗 **Live:** [toolkit.zajenckauskas.lt](https://toolkit.zajenckauskas.lt)

[![CI](https://github.com/dzajenckauskas/toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/dzajenckauskas/toolkit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)

---

## What it is

A hub of **48 small, focused tools** — image compression and cropping, JSON/JWT/regex
helpers, hashing and encoding, colour and design utilities, PDF and text tools, and
more — grouped into a searchable, keyboard-driven catalog (⌘K from anywhere).

Everything happens **client-side**: images are processed with the Canvas API, hashing
and encryption with the Web Crypto API, zipping with `fflate`. Nothing you drop into a
tool is ever uploaded — there is no backend that receives your files.

## Why I built it

Two goals, held at once:

1. **A genuinely useful, free product.** A no-friction place to do the small tasks
   developers and creators reach for constantly, without hunting for an ad-riddled
   site or installing desktop software. It's open-source so anyone can read it, run
   it, or learn from it.

2. **A deliberate practice ground for working with AI coding agents.** I use this
   project to get better at **AI-assisted engineering end to end** — research and
   competitive analysis, breaking work into GitHub issues and sprints, project
   management, code review, CI/CD, and the day-to-day engineering workflows that make
   an agent-driven codebase stay clean and maintainable rather than sprawl. The commit
   history intentionally reflects that human + AI collaboration.

The two reinforce each other: shipping and maintaining a real, deployed product is the
honest test of whether an AI-assisted workflow actually produces professional results.

## Architecture

A **Turborepo monorepo** (npm workspaces). One app, plus focused packages for the
parts that are genuinely shared — with boundaries the compiler enforces (see
[ADR-009](docs/decisions/ADR-009-turborepo-monorepo.md), which also explains why
Module Federation micro-frontends were deliberately **not** used).

```
apps/
  web/                       Next.js 15 (App Router) — the shell + every tool route
packages/
  ui/                        Emotion theme + typed design-system primitives (ADR-006)
  lib/                       framework-agnostic, unit-tested tool logic
  tools/                     the tool registry — single source of truth (ADR-008)
  typescript-config/         shared tsconfig presets
```

- **Registry-driven.** The home page, search/command palette, navigation, sitemap and
  per-page SEO metadata all read from one `registry.ts`. Shipping a tool is: add a pure
  function + tests in `@toolkit/lib`, a component in `apps/web`, a route, and a registry
  entry.
- **Stack.** Next.js 15 / React 19, **TypeScript in strict mode**
  (`noUncheckedIndexedAccess`, `noUnusedLocals`, …), Emotion CSS-in-JS with a typed
  theme and zero-JS light/dark mode, deployed as a static-optimised app.
- Packages are consumed from source via `transpilePackages` (no separate build step);
  Turbo caches `build` / `lint` / `typecheck` / `test` across the graph.

## Engineering practices

- **Tested.** 261 unit tests (Vitest) covering the pure logic, plus 77 end-to-end
  browser tests (Playwright, real Chromium) covering the tools in the browser.
- **Typed & linted.** Strict TypeScript, ESLint (zero warnings), one shared Prettier
  config across the whole workspace.
- **CI/CD.** Every push runs install → lint → format → typecheck → unit → build → e2e
  on GitHub Actions; green pushes to `main` auto-deploy to production (PM2 + nginx).
- **Decisions are written down.** Architecture and product decisions live as ADRs in
  [`docs/decisions/`](docs/decisions/).

## Getting started

Requires **Node 22+**.

```bash
npm install            # installs the whole workspace

npm run dev            # start the app (http://localhost:3000)
npm run build          # production build (via Turbo)
npm run lint           # ESLint across packages
npm run typecheck      # tsc across packages
npm test               # Vitest unit tests
npm run test:e2e       # Playwright browser tests
```

All scripts run through Turborepo from the repo root.

## Repository map

- [`apps/web`](apps/web) — the Next.js app: routes, components (grouped by
  `layout` / `catalog` / `tools/<category>`), and app-specific glue.
- [`packages/`](packages) — `ui`, `lib`, `tools`, `typescript-config`.
- [`ROADMAP.md`](ROADMAP.md) — direction and the tool catalog.
- [`CHANGELOG.md`](CHANGELOG.md) — meaningful changes over time.
- [`docs/decisions/`](docs/decisions/) — architecture decision records (ADRs).
- [`docs/PROJECT-STATE.md`](docs/PROJECT-STATE.md) — a living "start here" handoff.

## License

[MIT](LICENSE) © Danielius Zajenčkauskas
