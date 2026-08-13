---
title: "WCAG Color Contrast: What AA and AAA Actually Require"
description: The WCAG contrast ratios explained in plain terms — the 4.5:1 and 3:1 thresholds, when large text qualifies, the mistakes people make, and how to check your own palette.
category: Design & Accessibility
tool: contrast
date: 2026-07-15
keywords: wcag, color contrast, accessibility, aa, aaa, contrast ratio, wcag 2.1
---

"Make sure your text has enough contrast" is advice everyone nods along to and few can pin down. How much is enough? Where do the numbers 4.5:1 and 7:1 come from, and when is the smaller 3:1 threshold allowed? The Web Content Accessibility Guidelines (WCAG) give exact, testable answers — and they are simpler than they look.

## The ratios, precisely

Contrast in WCAG is expressed as a ratio between the brightness of the text and its background, from 1:1 (identical, invisible) to 21:1 (pure black on pure white). The guidelines define two conformance levels:

- **Level AA** — the practical standard most projects and laws aim for:
  - **4.5:1** for normal body text.
  - **3:1** for **large text** — 18pt and up, or 14pt and up if bold (roughly 24px, or 18.66px bold).
- **Level AAA** — a stricter target for maximum accessibility:
  - **7:1** for normal text.
  - **4.5:1** for large text.

There is a third, easy-to-forget rule: **non-text elements** — the visible boundary of a form input, an icon that conveys meaning, the bars of a chart — need **3:1** against their surroundings under AA. A pale-grey input border on a white card commonly fails this.

## Why this matters beyond ticking a box

It is tempting to treat contrast as a compliance chore, but the requirement exists because low contrast genuinely locks people out:

- **Low vision** affects a large and growing share of users.
- **Aging eyesight** reduces contrast sensitivity for nearly everyone eventually.
- **Context** does the rest: bright sunlight on a phone screen, a cheap monitor, a dimmed "night mode" — all erode whatever margin your design had.

Designing to 4.5:1 is not designing for a small minority; it is designing for your own users five years from now on a worse screen.

## How to test your own palette

The check is objective, so you do not have to guess. Our [contrast checker](/contrast) takes a text color and a background color and reports the exact ratio along with whether it passes AA and AAA for normal and large text. Enter your brand colors, nudge the lightness until it clears the threshold you are targeting, and you have a defensible answer instead of a hunch — computed in your browser, nothing uploaded.

## Common mistakes

Even teams that "check contrast" trip over the same things:

- **Testing text over an image at the wrong spot.** A photo has light and dark regions; the text must pass against the **busiest, lightest area it overlaps**, not an average. A scrim or solid plate behind the text is the reliable fix.
- **Forgetting interactive states.** Hover, focus, disabled and placeholder text often drop below the threshold even when the default state passes. Placeholder text in particular is a frequent failure — and it should never be the only label.
- **Ignoring icons and borders.** Meaningful icons, focus outlines and input borders fall under the 3:1 non-text rule, which is easy to miss when you are only eyeballing paragraphs.

## FAQ

### Is AA contrast legally required?

In many jurisdictions, effectively yes. Accessibility laws and standards — the ADA as interpreted in the US, the EN 301 549 standard behind the European Accessibility Act, Section 508, AODA in Ontario — reference WCAG (typically 2.1) at **Level AA** as the benchmark. Even where the letter of the law is debated, AA is the widely accepted bar that regulators and courts point to.

### What about large text — how big does it need to be?

WCAG defines "large" as at least **18 point** (about 24px) for regular weight, or **14 point** (about 18.66px) if the text is **bold**. At that size the 3:1 ratio applies instead of 4.5:1, because larger letterforms remain legible at lower contrast. Below those sizes, the 4.5:1 rule applies regardless of weight.

### Do icons and form borders really need to meet a ratio?

Yes, under WCAG 2.1's non-text contrast rule (1.4.11): user-interface components and meaningful graphics need **3:1** against adjacent colors. A decorative flourish is exempt, but anything a user must perceive to operate the interface — a toggle, an icon button, the edge of a text field — is in scope.

Want to check a color pair right now? Open the [contrast checker](/contrast) — it computes the exact ratio in your browser and tells you what passes.
