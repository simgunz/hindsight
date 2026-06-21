# Hindsight

A hands-free delayed video mirror for reviewing your own training form: the camera
films continuously and the screen shows you on a tunable delay, hands-free, with
nothing ever saved.

- **Production:** <https://hindsight.simgunz.org> (deploys from `main`)
- **Staging:** <https://staging--hindsight-210.netlify.app> (deploys from `staging`)

## Prerequisites

- Node (version pinned in [`.nvmrc`](.nvmrc) — run `nvm use`)
- npm

## Getting started

```bash
npm install
npm run dev        # start the dev server
```

## Scripts

| Script | Does |
|--------|------|
| `npm run dev` | Vite dev server |
| `npm run build` | type-check + production build to `dist/` |
| `npm run preview` | serve the production build locally |
| `npm run lint` | Biome lint + format check |
| `npm run format` | Biome format (writes) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (unit) |

## Tech stack

Web PWA, TypeScript, Vite (no UI framework). Delayed buffer via WebCodecs. Biome
(lint/format), Vitest (unit). Plain CSS, localStorage. Installable PWA + offline shell
via `vite-plugin-pwa`. Full rationale in [`docs/decisions/`](docs/decisions/).

## Project structure

```
docs/              planning docs (idea → stories → requirements → decisions; Zensical site)
public/            static assets + PWA icons
src/               app source
index.html         app entry
vite.config.ts     Vite + PWA config
biome.json         lint/format config
netlify.toml       deploy config
.github/workflows/ CI gate (lint + test)
```

## Deployment

Hosted on Netlify. Push to `main` deploys production; push to `staging` gets a branch
deploy; pull requests get preview deploys. A GitHub Actions gate (lint, type-check,
test) runs on every push and PR. `main` holds only stable, verified versions; active
work happens on `staging`.

## Documentation

Planning and design docs live in [`docs/`](docs/) (built into a Zensical site): vision,
user stories, requirements, and architecture decisions.
