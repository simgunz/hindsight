---
id: adr-0005
status: approved
---

# ADR 0005: Netlify hosting

## Context

Continuous deployment was wanted from day one — the walking skeleton must deploy from
the first commit. Hindsight is a static [web](0001-web-platform.md) app built with
[Vite](0002-vanilla-ts-vite.md), shipping static assets. Where is it hosted?

## Decision

Host on **Netlify**, connected to the GitHub repo. Push to `main` runs `vite build`
and deploys; pull requests get preview deploys. HTTPS — required for camera access —
is provided out of the box.

## Consequences

- **Zero-config CD with preview deploys** — each branch is viewable on a real HTTPS
  URL, useful for testing camera behavior on the phone before merge.
- **Free tier suffices** for a single-user tool; build settings (publish dir, build
  command) are confirmed at scaffold time.

## Alternatives considered

- **Vercel / Cloudflare Pages / GitHub Pages.** All viable for static hosting. Netlify
  chosen because it was already selected for this project and gives git-push CD plus
  preview deploys with no extra config. No reason to switch.
