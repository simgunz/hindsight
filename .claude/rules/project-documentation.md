# Project Documentation Conventions

Reusable, project-agnostic conventions for how a project's planning/PM documentation
is structured. Project-specific details (app name, actual feature areas) live in the
project's root `CLAUDE.md`.

## Purpose

Docs serve two audiences equally: the human (thinking through the project, tracking
progress) and Claude Code (reading them as context to build the app). The flow is
**idea → user stories → requirements → build** — deliberate PM, not straight to code.

## Folder structure

Markdown under `docs/`, built into a browsable site with **Zensical** (see Tooling).
Top-level sections render as nav tabs.

```
docs/
  index.md                       # project overview / elevator pitch + doc map
  vision/
    idea.md                      # free-form brain dump: problem, who, why, scope
    glossary.md                  # shared terms
    domain-context.md            # domain model + implementation heuristics
  user-stories/
    index.md                     # all stories grouped by area + status table
    epic-<area>.md               # (only when an area has many stories)
  requirements/
    index.md                     # status table + story->requirement traceability
    functional/
      <feature-area>.md          # grouped by feature area
    non-functional.md            # performance, UX, device, etc.
  decisions/
    index.md                     # ADR index
    NNNN-<title>.md              # one Architecture Decision Record per file
  open-questions.md              # deliberately unresolved items
```

## Granularity rule

**One file per feature area / epic — not per item, not one giant file.** Per-item
files fragment context (bad for human browsing and AI loading); one giant file
wastes context and loses separation of concerns. A cohesive per-area file lets
Claude read all related stories/requirements for an area in a single read.

Split user stories into per-epic files only when an area genuinely has many stories;
for a small app keep them in `user-stories/index.md` grouped by area.

## ID conventions

| Prefix | Applies to |
|--------|-----------|
| `US-NNN` | user stories |
| `FR-NNN` | functional requirements |
| `NFR-NNN` | non-functional requirements |
| `NNNN-<title>.md` | ADRs (zero-padded, e.g. `0001-use-postgres.md`) |

IDs are **stable and create traceability — not file boundaries.** Every story and
requirement is a heading carrying its ID (flat and zero-padded, e.g. `US-007`,
`FR-012`). Renumbering breaks links — assign once and keep.

## Traceability

Every requirement cites the user story ID(s) it serves, e.g. *"(Serves US-007)"*,
ideally as a clickable cross-link. Before changing a requirement, trace it back to
the story that motivated it; this guards against scope creep and helps Claude ask
better clarifying questions.

## Status

Status is **only** for docs with a real lifecycle that gates action: **requirements,
user stories, and ADRs.** Reference/narrative docs (vision, glossary, domain context,
home, open questions) carry **no** status — they are living context, not lifecycle
artifacts.

- **Requirements & user stories:** `draft` → `approved` → `in-progress` → `implemented`
  - `draft` — written, not yet agreed
  - `approved` — signed off; ready to implement
  - `in-progress` — implementation underway
  - `implemented` — built and verified
- **Decisions (ADRs):** `proposed` → `approved` → `rejected` → `superseded`
  - `proposed` — drafted, under consideration
  - `approved` — accepted, in force
  - `rejected` — considered and declined
  - `superseded` — replaced by a newer ADR

Set status in YAML front matter (`status: approved`). It renders as a Zensical nav
badge and is machine-parseable: an instruction like *"only implement requirements
with `status: approved`"* is literal and checkable.

**Two layers of status:**

| Layer | Granularity | Mechanism |
|-------|-------------|-----------|
| Nav badge | per file | front-matter `status:` |
| Status table | per item (`US-NNN`, `FR-NNN`) | hand-maintained table in each section `index.md` |

The badge is a coarse roll-up (a file holds many items that can differ); the per-item
table in `index.md` is the source of truth for individual items.

**When building:** only act on requirements whose status is `approved` (or later).
Treat `draft` as not-yet-agreed. After implementing an item, advance its status in
the per-item table, and the file badge once all its items are done.

## Tooling (Zensical)

- Run with `uvx zensical serve` (live reload) / `uvx zensical build --clean`. No
  global install needed.
- Custom status values + colors are defined in `zensical.toml`
  (`[project.extra.status]`) and `docs/stylesheets/extra.css`.
- **Keep the build clean** — a warning-free `zensical build` is a guardrail. Known
  gotchas:
  - **No `tags:` front matter** unless the tags plugin is configured — the link
    checker reads `[a, b]` as an undefined link reference and warns.
  - **Cross-file heading anchors** collapse ` — ` (spaced em-dash) to a single `-`.
    A heading `### US-001 — Title` yields anchor `#us-001-title`, not `--title`.
  - Prefer **per-file status badges** over relying on `navigation.indexes`
    section-landing badges (feature parity with Material is still stabilizing).
