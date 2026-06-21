---
id: adr-0004
status: approved
---

# ADR 0004: Tooling — Biome and Vitest

## Context

With the language and build tool set ([Vanilla TS + Vite](0002-vanilla-ts-vite.md)),
the project needs linting/formatting and a test runner. Same priorities: Claude Code
effectiveness, maturity, simplicity, low config. This is the one decision recorded as
a grouped ADR (development tooling), rather than one ADR per tool.

## Decision

- **Lint + format:** **Biome** — one fast tool for both, near-zero config,
  TypeScript-first.
- **Unit tests:** **Vitest** — Vite-native (shares the Vite transform and config),
  Jest-compatible API.
- **End-to-end tests:** **deferred.** The app is simple; no E2E harness for v1.
  (Playwright with Chromium fake-media flags is the likely choice if E2E is added.)

## Consequences

- A single linter+formatter and a Vite-native runner keep config and CI minimal.
- Vitest reuses the Vite pipeline — no separate test build.
- Deferring E2E avoids maintaining a browser-automation harness for a simple app;
  revisit if interaction logic grows.

## Alternatives considered

- **ESLint + Prettier.** The legacy standard, but two tools and more config for no
  benefit at this scale. Rejected.
- **Jest (unit).** More setup on a Vite project than the API-compatible Vitest. Rejected.
