---
id: requirements
status: draft
---

# Requirements

Formal functional (`FR-NNN`) and non-functional (`NFR-NNN`) requirements, derived
from the [user stories](../user-stories/index.md). Each requirement cites the story
ID(s) it serves. Functional requirements are grouped by feature area in the pages
under this section.

> **Status:** `draft` — awaiting sign-off. Once approved, set each file's
> front-matter `status` to `approved`, then to `in-progress` / `implemented` as
> work proceeds.

## Functional requirements

| ID | Requirement | Serves | File | Status |
|----|-------------|--------|------|--------|
| FR-001 | Continuous delayed display | US-001 | Delayed Mirror | draft |
| FR-002 | Delayed view shown un-mirrored | US-001 | Delayed Mirror | draft |
| FR-003 | No persistence (in-memory buffer only) | US-002 | Delayed Mirror | draft |
| FR-004 | Startup delay ramp | US-001 | Delayed Mirror | draft |
| FR-005 | Loop runs hands-free | US-001 | Delayed Mirror | draft |
| FR-006 | Set base delay (5–180s, default 60) | US-003 | Delay Control | draft |
| FR-007 | Delay change takes effect immediately | US-003 | Delay Control | draft |
| FR-008 | Delay presets (persisted) | US-004 | Delay Control | draft |
| FR-009 | Horizontal drag scrubs the buffer | US-005 | Playback | draft |
| FR-010 | Repeatable rewatch | US-005 | Playback | draft |
| FR-011 | Single tap toggles pause/resume | US-006 | Playback | draft |
| FR-012 | Double tap returns to base delay | US-007 | Playback | draft |
| FR-013 | Scrubbing is bounded | US-005 | Playback | draft |
| FR-014 | Live front-camera view, zero delay | US-008 | Live Mirror | draft |
| FR-015 | Live view is mirrored | US-008 | Live Mirror | draft |
| FR-016 | Switching modes suspends/resumes the loop | US-008 | Live Mirror | draft |

## Non-functional requirements

| ID | Requirement | Serves | Status |
|----|-------------|--------|--------|
| NFR-001 | Minimal, distraction-free UI | US-009 | draft |
| NFR-002 | Gesture-based controls | US-009 | draft |
| NFR-003 | Glanceable, legible at distance | US-009 | draft |
| NFR-004 | Screen stays awake while active | US-001 | draft |
| NFR-005 | No audio captured | US-002 | draft |
| NFR-006 | Works in portrait and landscape | US-001 | draft |

See [Non-functional](non-functional.md) for detail.

## Extensibility Notes

Architectural considerations so v1 does not paint into a corner. These are *not*
features to build now.

| Concern | Design Consideration |
|---------|---------------------|
| New modes later | Model the view as a mode enum (`delayed-rear`, `live-front`) rather than a single boolean, so an additional mode slots in without rework. |
| More presets / custom presets | Store presets as a small ordered list of `{label, delaySeconds}`, not hardcoded values, so adding or editing presets is a data change. |
| Lightweight settings | Persist only small key-values (base delay, presets); keep this separate from any video pipeline so persistence choices never touch the buffer. |
| Buffer tuning | Treat the buffer window and rewatch headroom as configuration values, not magic numbers, so they can be tuned per device without code changes elsewhere. |
