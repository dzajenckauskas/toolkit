# Accessibility runner operations

The `/accessibility-checker` route is backed by `apps/accessibility-runner`, a localhost-only Node
service that launches Playwright Chromium. ADR-010 explains why it is isolated from the web app.
The web form accepts either a full URL or a bare hostname and assumes HTTPS when the scheme is
omitted. The runner still validates the normalized URL and rejects unsafe or non-public targets.

## Production prerequisites

1. Install the Playwright Chromium operating-system dependencies once on the VPS using the
   appropriate privileged deployment account:

   ```bash
   cd /var/www/toolkit
   npx playwright install --with-deps chromium
   ```

2. Keep port `4317` bound to `127.0.0.1`; never expose it through nginx or the public firewall.
3. Apply an OS/container egress policy to the runner process that denies loopback, RFC1918,
   link-local, cloud metadata, and other private network destinations. The application performs
   DNS/IP checks too, but network isolation is the final SSRF boundary.
4. Ensure the VPS has enough memory for the configured Chromium concurrency. The default is one
   active audit with three queued requests.

`deploy.sh` generates a persistent service token on first deploy, builds both workspaces, ensures
the pinned Chromium revision exists, and manages `toolkit` plus `toolkit-accessibility-runner` in
PM2. Runtime artifacts expire after one hour by default.

## Health check

From the VPS only:

```bash
curl http://127.0.0.1:4317/health
```

The response reports whether the runner is healthy and its active/queued counts. Audit endpoints
require the bearer token and are intended to be reached only through Toolkit's same-origin route
handlers.
