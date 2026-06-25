---
id: decisions
status: approved
---

# Decisions (ADRs)

Architecture Decision Records. Each significant technology or architecture choice
gets its own file (`NNNN-title.md`) with a `status` of `proposed`, `approved`,
`rejected`, or `superseded`.

| ADR | Decision | Status |
|-----|----------|--------|
| ADR | Decision | Status |
|-----|----------|--------|
| [0001](0001-web-platform.md) | Web platform (vs native) | approved |
| [0002](0002-vanilla-ts-vite.md) | Vanilla TypeScript + Vite, no UI framework | approved |
| [0003](0003-installable-pwa.md) | Installable PWA with an offline app shell | approved |
| [0004](0004-tooling-biome-vitest.md) | Tooling — Biome and Vitest | approved |
| [0005](0005-netlify-hosting.md) | Netlify hosting | approved |
| [0006](0006-github-actions-ci-gate.md) | GitHub Actions CI gate | approved |
| [0007](0007-plain-css.md) | Plain CSS for styling | approved |
| [0008](0008-localstorage.md) | localStorage for settings persistence | approved |
| [0009](0009-delayed-playback-buffer.md) | Delayed playback via WebCodecs | approved |
| [0010](0010-orthogonal-interaction-model.md) | Orthogonal camera/delay interaction model | approved |
| [0011](0011-seek-based-playback.md) | Random-access playback via keyframe seek | approved |

## Stack summary

| Layer | Choice | ADR |
|-------|--------|-----|
| Platform | Web | 0001 |
| Language | TypeScript | 0002 |
| Build / dev server | Vite | 0002 |
| UI framework | none (vanilla DOM + media APIs) | 0002 |
| Delivery | Installable PWA + offline shell (vite-plugin-pwa) | 0003 |
| Lint + format | Biome | 0004 |
| Unit tests | Vitest | 0004 |
| E2E tests | deferred | 0004 |
| Hosting / CD | Netlify | 0005 |
| CI gate | GitHub Actions (lint + type + test) | 0006 |
| Styling | plain CSS | 0007 |
| Settings persistence | localStorage | 0008 |
| Delayed buffer | WebCodecs (in-memory ring buffer of EncodedVideoChunks) | 0009 |

> **Validated:** ADR 0009 (WebCodecs) confirmed on-device (Android Chrome + iPhone
> Safari) on 2026-06-22; Firefox mobile is an accepted limitation.
