---
id: adr-0007
status: approved
---

# ADR 0007: Plain CSS for styling

## Context

The entire UI is one full-screen view plus a small fading text overlay — there is no
component tree or design system. A styling approach is still needed.

## Decision

Use **plain CSS** in a single stylesheet.

## Consequences

- Minimal dependency surface and the most debuggable styling path.
- No build-time styling abstraction over the view.

## Alternatives considered

- **Tailwind / a CSS framework.** Value comes from composing many components; there
  are effectively none here, so it would add tooling for no benefit. Rejected.
