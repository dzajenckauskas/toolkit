# Toolkit Blog — Launch Plan

## 1. Goals

- Get the main toolkit domain indexed and building topical authority faster than
  tool pages alone can.
- Target long-tail, informational search queries that a one-line tool
  description can't rank for.
- Reinforce the "runs locally, nothing uploaded" differentiator in long-form,
  credible detail.
- Feed internal links back to specific tool pages (not the homepage) to spread
  link equity.

## 2. Where it lives

`yourtoolkit.com/blog/` — same domain, not a subdomain and not a third-party
host (Blogger, Medium, etc.). Keeping it on the root domain means all SEO value
accrues to the one property you're trying to build authority for, instead of
splitting across two crawl targets.

## 3. Technical setup

- **Content format:** Markdown/MDX files in the repo (see prior recommendation —
  no CMS needed at this stage).
- **Rendering:** Statically generated at build time, not client-side rendered —
  this matters both for SEO crawlability and for page speed.
- **URL structure:** `/blog/remove-gps-data-from-photos` (slug only, no date in
  URL — dates in URLs age content visually and complicate updates).
- **Each post needs:**
  - Unique `<title>`, meta description, canonical URL, OG/Twitter tags (matching
    the pattern already used on tool pages)
  - `robots: index, follow, max-image-preview:large, max-snippet:-1`
  - FAQPage JSON-LD for the FAQ section
  - A visible "Try the tool" link/button near the top and bottom of the post
  - Related-posts or related-tools block at the end

## 4. Editorial guardrails

- **Length:** 600–1000 words. Long enough to fully answer the topic, not padded
  with filler "chapters" the way some competitor content is.
- **One real differentiator per post:** every post should say something a
  server-side competitor tool genuinely can't say truthfully (e.g., "this never
  leaves your device").
- **No fabricated stats or authority claims.** Real explanations only.
- Every post ends with **one specific tool link**, not a generic "check out our
  toolkit" CTA.

## 5. Cadence

Start with **1 post every 1–2 weeks**. Content compounds slowly — five solid,
accurate posts beat twenty rushed ones. Revisit cadence once you see which posts
start getting traffic (Search Console) and double down on that topic cluster.

## 6. Taxonomy (keep it small at launch)

- **Privacy & Security** — metadata, JWTs, TOTP, encryption
- **Developer Tools** — JSON, regex, hashing, formatting
- **Design & Accessibility** — contrast, color, WCAG

Add categories only once you have 3+ posts that justify one — an empty category
page is a weak page.

## First 5 Posts

### Post 1: "Remove GPS Location From Photos Before You Post Them Online"

- **Slug:** `/blog/remove-gps-data-from-photos`
- **Links to:** Metadata cleaner tool
- **Category:** Privacy & Security
- **Target length:** 700–900 words

Outline:

- Hook: a photo posted from home can leak your exact address via embedded GPS
  coordinates
- What EXIF data actually contains (location, device model, timestamp)
- Who this matters for: parents posting kid photos, online sellers,
  journalists/activists, real estate listings
- How to check what's hidden in your own photo
- Step-by-step: strip it in-browser — contrast explicitly with sites that
  require upload
- FAQ: Does this affect photo quality? Does it work on iPhone/Android exports?
  What about screenshots?

### Post 2: "How to Decode a JWT Without Pasting It Into a Random Website"

- **Slug:** `/blog/decode-jwt-safely`
- **Links to:** JWT tool
- **Category:** Developer Tools
- **Target length:** 600–800 words

Outline:

- What a JWT actually is (header/payload/signature), plain-language, one diagram
- Why "just decode it online" is quietly risky — payloads often contain more
  than expected
- The right way: decode locally, show there's no outbound network request
  (screenshot of dev tools)
- Common JWT debugging tasks: checking expiry, confirming claims, verifying
  algorithm
- FAQ: Can I verify a signature without the secret? Is a JWT encrypted or just
  encoded?

### Post 3: "WCAG Color Contrast: What AA and AAA Actually Require"

- **Slug:** `/blog/wcag-color-contrast-explained`
- **Links to:** Contrast checker (+ Accessibility checker)
- **Category:** Design & Accessibility
- **Target length:** 800–1000 words

Outline:

- Quick, factual definition: AA/AAA contrast ratios (4.5:1 / 3:1 large text /
  AAA 7:1 & 4.5:1)
- Why this matters beyond compliance: low vision, aging eyesight, glare on mobile
- How to test your own palette with the tool
- Common mistakes: text-on-image busiest-point testing, hover/focus states,
  placeholder text
- FAQ: Is AA legally required? What about icons and form borders?

### Post 4: "What Is a TOTP Code, and How Do Authenticator Apps Actually Work?"

- **Slug:** `/blog/how-totp-2fa-codes-work`
- **Links to:** TOTP/2FA generator
- **Category:** Privacy & Security
- **Target length:** 600–800 words

Outline:

- Core idea: shared secret + current time = independently-computed code
- Why codes expire every 30 seconds, and why that beats SMS codes
- Common uses: setting up 2FA, developers testing their own auth flow
- Demo: generate a code from a secret, nothing sent anywhere
- FAQ: Same as Google Authenticator? Can two devices generate the same code?
  Clock drift issues?

### Post 5: "Why Your Password Generator Should Never Touch a Server"

- **Slug:** `/blog/client-side-password-generation`
- **Links to:** Password generator tool
- **Category:** Privacy & Security
- **Target length:** 600–800 words

Outline:

- The uncomfortable fact: a "free password generator" that sends your request to
  a server could log the password it just generated for you
- What true randomness requires (`crypto.getRandomValues()` vs. `Math.random()`)
  — explain the difference plainly, since many free tools quietly use the weaker
  one
- How to verify a tool is actually client-side (no network tab activity when you
  click "generate")
- Practical guidance: length vs. complexity, passphrases vs. random strings, why
  reuse is the real risk
- FAQ: Is a longer password always better? Should I trust my browser's built-in
  generator? What about password managers?

**Why this one rounds out the launch set:** "password generator" is a saturated
keyword, but almost no competing content actually explains why client-side
generation matters for this specific tool — most password-generator pages are
just the tool with no supporting content at all. This post pairs your most
commonly-searched tool with content nobody else in the space has bothered to
write, and it reinforces the security-conscious brand angle running through
posts 2 and 4.

## Suggested launch order

1. **Metadata cleaner** (broadest audience, strongest privacy story)
2. **Password generator** (highest search volume tool, currently thin
   competition on the content side)
3. **JWT decoder** (developer audience, shareable in dev communities)
4. **TOTP/2FA** (curiosity-driven, reinforces security angle)
5. **WCAG contrast** (longest, most evergreen — good to publish once the cadence
   is established)
