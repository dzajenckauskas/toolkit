# ADR-010: Add a server-assisted accessibility checker as an explicit exception

- Status: Accepted
- Date: 2026-08-10

## Context

Toolkit's existing tools run entirely in the browser. The accessibility checker is materially
different: meaningful keyboard-journey evidence requires a controlled browser, clean sessions,
repeat runs, screenshots, and Playwright. Shipping it as `/accessibility-checker` therefore cannot
honestly use Toolkit's usual “everything stays on your device” claim.

Running a browser against user-provided URLs also creates operational and security risks that do
not exist in client-only tools: server-side request forgery (SSRF), access to private network
targets, unbounded Chromium processes, resource exhaustion, retained artifacts, and abusive use
against third-party sites.

## Decision

Add the accessibility checker to Toolkit as the first explicitly **server-assisted** tool.

- The user interface, report rendering, downloads, and report comparison live in the existing
  Next.js app at `/accessibility-checker` and use Toolkit's shared shell and design system.
- A separate `apps/accessibility-runner` process owns Playwright and binds to localhost only.
- The web app reaches the runner through same-origin route handlers authenticated with a shared
  service token. Browsers never receive the runner address or token.
- The runner rejects loopback, link-local, private, multicast, and reserved IP targets; applies the
  same check to browser subrequests; limits concurrency, rate, queue depth, and run duration; and
  expires artifacts automatically.
- Production must additionally prevent the runner process from reaching private networks or cloud
  metadata endpoints at the operating-system or container-network layer. Application checks are
  defence in depth, not the only boundary.
- Reports are portable JSON. Toolkit does not add accounts or permanent report storage.
- Product copy labels this tool as server-assisted and explains that the submitted URL and the
  pages/resources required for the audit are fetched by the runner.

## Consequences

### Positive

- The checker can reproduce real keyboard behavior and collect evidence that a browser-only tool
  cannot obtain cross-origin.
- The public route shares Toolkit's navigation, SEO, accessibility, and report UX.
- Process isolation keeps expensive or failed audits out of the main Next.js process.

### Negative / operational requirements

- This is an explicit exception to ADR-008's all-client-side rule and requires honest global copy.
- The VPS must support Playwright Chromium and its operating-system dependencies.
- Deployment now manages two long-running processes and two shared environment variables.
- Public browser automation requires monitoring and may need stronger distributed rate limiting if
  the service grows beyond one VPS.

## Alternatives considered

### Run Playwright inside the Next.js process

Rejected. Browser crashes, memory pressure, and long-running jobs would share a failure boundary
with the public site.

### Run the audit entirely in the visitor's browser

Rejected. Browser same-origin policy prevents inspecting arbitrary third-party documents, and a
normal browser tab cannot provide the clean, controlled sessions the evidence model requires.

### Keep the checker as an unrelated standalone site

Rejected by the owner in favour of one Toolkit product surface and the canonical
`/accessibility-checker` URL.
