# Competitor scan — images.net

- Date: 2026-07-24
- Source: owner-provided screenshots (the live site blocks automated fetch).
- Purpose: benchmark feature set + UX against our plan and adjust the roadmap.

## What images.net offers

**Operations (from the action menu):**

1. Compress image
2. Resize Image
3. Crop image
4. Rotate image
5. Convert to JPG
6. Convert from JPG
7. Upscale image
8. Remove Watermark

**UX / product model — the notable difference:**

images.net is **library-centric**, not tool-centric. The primary screen is a
**"My images"** workspace where the user:

- adds images once (a prominent **+** button),
- sees them in a list/gallery with **Filter** and **Select all**,
- then applies an operation from a single action menu (**batch-capable**).

So the mental model is *"add my images, then act on them"* — one image pool,
many operations, batch selection — rather than a separate upload per tool.

**Visual style:** clean and minimal; monochrome line icons in rounded squares,
a green brand accent, simple list rows, a bottom-sheet action menu on mobile.
Good, calm UI — consistent with our own `design-principles.md`.

### Desktop landing page (from the Chrome PDF)

Structure: header nav (How it works · Prices · FAQs · Tools ▾ · Sign up ·
**Login**) → hero **"All the online tools you need to edit your images"** /
*"Easily convert, compress, resize, and enhance your images in one place."* → an
**8-tool grid** with one-line descriptions → **"Transform your images in 3
simple steps"** → a **"All the tools you need in one place"** showcase carousel →
**FAQ accordion** → a rich dark footer repeating the tools + links.

Their tool copy (useful reference for our own):

- Compress — "Reduce the size of your JPG, PNG, SVG or GIF images without losing quality."
- Resize — "Change the dimensions of your images in seconds without affecting quality."
- Crop — "Select the exact portion of the image you need."
- Rotate — "Rotate your images in any direction quickly and easily."
- Convert to JPG — "Convert PNG, SVG, GIF, and more images to JPG…"
- Convert from JPG — "Convert your JPG files to PNG, SVG, GIF and other formats…"
- Upscale — "Increase the size of your images while maintaining the best possible quality."
- Remove Watermark — "Remove watermarks from your images quickly and effortlessly."

**Formats they emphasize:** JPG, PNG, **SVG**, **GIF** (WebP/AVIF are not
highlighted). SVG and GIF handling is a differentiator on their side worth noting
for our Converter scope.

### Business model — the key strategic finding

images.net is a **trial-to-subscription paywall**. The "3 steps" end with:

> **"Sign up and pay €0.50 for a 7-day trial to download your file. Then
> €39/month if you don't cancel."**

You do all the editing for free, then hit an **account + payment wall to
download**, with a €0.50 trial that **auto-renews to €39/month**. The entire FAQ
is about the subscription, the 7-day trial limits, when the €39 is charged,
cancelling, and refunds.

**This is exactly the anti-pattern our `vision.md` positions against** ("simple
web tools are often cluttered … privacy-unclear … or designed mainly to drive
subscriptions"). It sharpens our differentiation:

| | images.net | Ecommerce Toolkit |
| --- | --- | --- |
| Cost to download | €0.50 trial → **€39/mo** auto-renew | **Free** |
| Account | Required | **None** |
| Where processing runs | Server (upload required) | **In your browser** |
| Privacy | Images uploaded | **Images never leave the device** |
| Time to result | Blocked behind sign-up/payment | **Instant download** |

We should lean into "**free, private, no sign-up, instant download, runs in your
browser**" as the headline positioning — it's a genuine, defensible contrast.

## Comparison to our plan

| images.net | Our tool | Status |
| --- | --- | --- |
| Compress image | Image Optimizer | ✅ built (`/optimize`) |
| Crop image | Image Cropper | ✅ built (`/crop`) |
| Resize Image | Image Resizer | 📋 planned (Phase 2) |
| Convert to/from JPG | Image Converter | 📋 planned (Phase 2) |
| **Rotate image** | — | ❌ **not in our plan** |
| **Upscale image** | — | ❌ **not in our plan** |
| **Remove Watermark** | — | ❌ **not in our plan** |
| — | Download-all-as-ZIP, quality presets, remembered settings, explicit local-processing/privacy | ✅ we go deeper here |

## Gaps to close

### 1. Rotate image — add as a core tool (easy, in-scope)

Purely client-side via Canvas (90° steps, arbitrary angle, horizontal/vertical
flip). No new dependencies, consistent with ADR-005. **Recommend adding to
Phase 2** alongside Resizer/Converter. (Our cropper spec left rotation as "if
justified"; a dedicated Rotate tool is the cleaner home for it.)

### 2. Upscale image — needs an approach decision

Two very different implementations:

- **Basic (Canvas interpolation):** trivial and local, but only *stretches*
  pixels — it adds no real detail, so the quality bar is low. Arguably not worth
  shipping as "upscale".
- **AI super-resolution:** real quality, but needs either a heavy in-browser
  WASM model (bundle/compute cost) or a server/paid API — which conflicts with
  our **no-backend, privacy-local, no-AI-in-MVP** stance (ADR-004/005).

**Recommendation:** treat Upscale as **Post-MVP / AI (Phase 5)**, gated on an
owner decision about the approach. Do **not** ship a naive canvas "upscale"
dressed up as more than it is.

### 3. Remove Watermark — **needs an explicit owner policy decision (flagged)**

This one carries real **legal/ethical risk**. Watermark removal is dual-use:

- **Legitimate:** removing *your own* watermark, or one on content you've
  licensed with the right to alter it.
- **Infringing:** stripping *someone else's* watermark is commonly a way to
  misappropriate copyrighted images.

A general "remove any watermark" tool would mostly enable the second case, and
it also effectively requires AI inpainting (against ADR-004 for the MVP).

**Recommendation:** do **not** build a general watermark remover. If we pursue
anything here, scope it narrowly to *the user's own* watermark with clear
in-product guidance that they must own or be licensed for the image, and require
**owner sign-off on the policy first**. Marked `needs:decision`; parked in
Phase 5, not the near-term plan.

### 4. UX model — consider a unified "My Images" workspace

images.net's biggest UX idea is the **single image library + batch action menu**.
Our current per-tool routes (`/optimize`, `/crop`, …) are simpler to build but
make a multi-step job ("crop then compress these 10") clunky. Their model is
essentially our **Phase 4 "project workflows"**, minus the persistence.

**Recommendation:** keep shipping standalone tools (ADR-001), but pull a
lightweight **shared image workspace** forward from Phase 4 as an explicit near-
term direction: one place to add images, then route them into any tool (and
eventually chain operations). This is also what the shared file-queue in Phase 3
is for. Track as a design/research item, not immediate build.

## UX patterns worth adopting (the good parts, minus the paywall)

Their landing/UX is genuinely well-structured. Worth borrowing for our own
marketing/home page:

- A clean **hero + tool grid** (icon, title, one-line description per tool).
- A **"how it works in 3 steps"** explainer — but our step 3 is *"Download —
  free, instantly, no sign-up"*, not a payment wall.
- A concise **FAQ** — ours answers "Is it free? (yes)", "Do you upload my
  images? (no, they stay in your browser)", "Do I need an account? (no)".
- The **"all in one place"** message + the **unified workspace** (#29) idea.

We adopt the structure and polish; our content flips their paywall/privacy story
into our advantage.

## Resulting plan adjustments

- **Roadmap:** add **Rotate** to Phase 2 (core tools); add **Upscale** and
  **Remove Watermark** to Phase 5 with the caveats above; add a **"unified image
  workspace"** direction bridging Phases 3–4.
- **Tools overview:** add Rotate / Upscale / Remove-Watermark definitions; note
  Convert is bidirectional (to/from JPG + PNG/WebP/AVIF); note the workspace UX.
- **Issues (Inbox, none `agent:ready`):** Rotate tool; Upscale (approach
  decision); Remove Watermark (policy decision); Image workspace (design/research).

## Confidence & unresolved

- Feature list is confident (from screenshots). Detailed flows/pricing/account
  model of images.net are unconfirmed (site blocked automated fetch).
- Open owner decisions: Upscale approach; Remove-Watermark policy; whether to
  prioritize the unified workspace over more standalone tools.
