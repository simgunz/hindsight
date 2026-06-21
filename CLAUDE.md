# Hindsight

A hands-free delayed video mirror for reviewing your own training form: the camera
films continuously and the screen shows you on a tunable delay, hands-free, with
nothing ever saved.

## Tech Stack

Web app, TypeScript, Vite, no UI framework. Installable PWA + offline shell
(vite-plugin-pwa). Delayed buffer via WebCodecs. Biome (lint/format), Vitest (unit;
E2E deferred). Plain CSS, localStorage. Hosted on Netlify with a GitHub Actions test
gate. Rationale and full stack in `docs/decisions/`.

## Conventions & workflow

- TypeScript; code style and linting enforced by Biome (`npm run lint`), unit tests
  with Vitest.
- Branch model: work on `staging`; `main` holds only stable, verified versions. The
  CI gate (lint + type-check + test) must pass before merge to `main`.
- Build only requirements with `status: approved` (see `docs/requirements/`).

## Documentation

Planning docs live in `docs/` (built into a Zensical site):

| Area | Path |
|------|------|
| Vision | `docs/vision/` (idea, glossary, domain context) |
| User Stories | `docs/user-stories/index.md` |
| Requirements | `docs/requirements/` |
| Decisions | `docs/decisions/` |
| Open Questions | `docs/open-questions.md` |
