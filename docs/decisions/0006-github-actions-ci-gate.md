---
id: adr-0006
status: approved
---

# ADR 0006: GitHub Actions CI gate

## Context

[Netlify](0005-netlify-hosting.md) deploys on push, but deploying-then-discovering is
not a guardrail. Unsupervised / vibe-coding sessions need a deterministic check that
broken code cannot silently reach `main`. The checks are the
[tooling](0004-tooling-biome-vitest.md) already chosen.

## Decision

Run a **GitHub Actions** workflow on push and pull request:

- Biome (lint + format check)
- `tsc --noEmit` (type check)
- Vitest (unit tests)

Actions runs the **test gate**; Netlify does the **deploy**. Production deploys happen
on green `main`.

## Consequences

- A deterministic guardrail so lint/type/test failures never deploy — the safety net
  for autonomous work.
- PR status checks make breakage visible before merge.
- One small workflow file; stays honest as the app grows.

## Alternatives considered

- **Netlify-only (no Actions).** Netlify can build on push, but a separate gate keeps
  failures from deploying and runs independently of the host, with PR status checks.
  Kept the gate.
