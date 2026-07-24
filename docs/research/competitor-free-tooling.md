# Competitor scan — free-tooling.com

- Date: 2026-07-24
- Source: owner-provided screenshots (site blocked to automated fetch here).
- Purpose: catalog its tools + UX and decide how it affects our direction.

## Positioning — validates our strategy

Hero tagline: **"No account. No paywall. No nonsense. Just a tool running in
your browser."**

That is almost word-for-word the positioning we landed on after the images.net
scan (free, no sign-up, browser-local, private). free-tooling.com is the
**inverse of images.net**: no paywall, client-side, privacy-first — but applied
to a **broad, generalist** set of utilities rather than a focused domain.

## UX / product model

- **Left sidebar**, tools grouped by category, with a **search** box ("Search
  tools…") both in the sidebar and the hero.
- Main area: **category sections of tool cards** (icon, title, one-line
  description). Clean, calm, lots of whitespace.
- Sidebar footer: **theme switcher** (light / dark / system) + an **accent-color
  picker**, and a "Send feedback" link.
- Everything runs client-side.

This is a strong, scalable model for a *many-tool* catalog — closer to a
"utility hub" than our current per-tool routes.

## Full tool catalog (~28 tools, 8 categories)

| Category | Tools |
| --- | --- |
| Text & Documents | Markdown, Mermaid, Markdown+Mermaid, Text Diff, Lorem Ipsum |
| PDF | PDF Editor, Redact PDF, Images to PDF |
| Calculators | Notepad Calculator |
| Images & Media | Image Editor, Video Editor, Screenshot Beautifier, QR Code, Code Image, Favicon Generator, Text to Handwriting |
| Developer | JSON Validator, JWT, Regex Tester, Base64, Hash Generator, File Checksum Verifier, UUID Generator, Password Generator |
| Design | Colors, Diagram Builder |
| Privacy | Metadata Cleaner |
| Productivity | Focus Timer, Kanban Board |

## The strategic question this raises

free-tooling.com is a **generalist** suite. We are (today) a **focused ecommerce
image toolkit** (`vision.md`, `target-users.md`, ADR-001). "Recreate many of
these" is therefore not a feature list — it's a **product-direction decision**:

- **Option A — Stay focused.** Cherry-pick only the tools that serve ecommerce
  image prep; ignore dev/text/productivity tools. Keeps a sharp identity.
- **Option B — Broaden into a free, private, browser-based tool hub** (compete
  with free-tooling.com directly, using the same "no account / no paywall"
  positioning). Bigger surface, weaker focus, but our architecture (shared
  primitives, per-tool routes, client-side Canvas) already scales to it, and the
  "unified workspace + tool catalog + search" UX here is a good blueprint.

This needs an explicit owner call; I will not silently expand a focused
ecommerce toolkit into a 28-tool generalist suite.

## Mapping to our focus (if we stay Option A)

**On-brand for ecommerce image prep — worth considering:**

- **Metadata Cleaner** — strip EXIF/GPS from product photos (privacy; we already
  drop metadata in the optimizer — could be a first-class tool). Strong fit.
- **Images → PDF** — line sheets / product catalogs / supplier docs. Good fit.
- **QR Code** — product links, packaging, store signage. Plausible fit.
- **Favicon Generator** — store/brand branding assets. Plausible fit.
- **Screenshot Beautifier** — marketing/listing imagery. Plausible fit.
- **Colors** — brand palette extraction from product images. Plausible fit.

**Already ours or planned:** Compress (Optimizer), Crop, Resize, Convert, Rotate.

**Out of scope for an ecommerce image toolkit (generalist):** Markdown, Mermaid,
Text Diff, Lorem Ipsum, PDF Editor, Redact PDF, Notepad Calculator, JSON/JWT/
Regex/Base64/Hash/Checksum/UUID/Password, Diagram Builder, Video Editor, Text to
Handwriting, Code Image, Focus Timer, Kanban Board. These only make sense under
Option B.

## UX ideas worth adopting either way

- **Tool catalog + search** (the sidebar/grid model) — better than isolated
  routes once we have >3–4 tools; pairs with the unified "My Images" workspace
  (#29).
- **Theme switcher (light/dark/system) + accent picker** — small, delightful,
  and our Emotion theme already supports light/dark via CSS variables; adding a
  toggle + accent is easy and on-brand.

## Recommendation

1. **Decide A vs. B first** (owner) — it changes the roadmap fundamentally.
2. Regardless: adopt the **catalog + search UX** and a **theme/accent switcher**.
3. If A: consider **Metadata Cleaner** and **Images → PDF** as the next tools
   (clearest ecommerce fit), plus finishing Resize/Convert/Rotate.
4. Their tagline confirms our **free / no-account / private / in-browser**
   positioning is the right hill — lean into it on the landing page.
