---
id: adr-0010
status: approved
---

# ADR 0010: Orthogonal camera/delay interaction model

## Context

The approved requirements framed two distinct modes: a **Delayed Mirror** (rear
camera, delayed, scrub/pause) and a **Live Mirror**
([FR-014](../requirements/functional/live-mirror.md#fr-014-live-view-delay-0)–FR-016,
[US-008](../user-stories/index.md#us-008-live-mirrored-view)) — front camera, zero
delay — with a mode switch that suspends and resumes the loop. The base delay ranged
5–180s ([FR-006](../requirements/functional/delay-control.md#fr-006-set-base-delay)).

Two problems surfaced while designing the interaction model:

1. The Delayed↔Live switch needed its own gesture, but the playback vocabulary
   (single tap, double tap, horizontal drag) was already spent. Any assignment fused
   a *camera* switch with the *playback offset* axis, which read awkwardly and risked
   accidental mode changes mid-review.
2. There was no in-loop way to correct a base delay set too long — the user had to
   open settings.

## Decision

Model the app as **two orthogonal axes**:

- **Camera** — front or back, a persistent toggle button. Determines mirroring.
- **Delay** — a continuum from `0` (live) to 180s. **Live is delay `0`, the forward
  edge of the buffer — not a separate mode.**

Mirroring becomes a function of the camera (front mirrored, back not). Double-tap
toggles between the two home offsets, base and live (any off-home position resets to
base). The full state machine, gestures, and behavioural rules live in the
[interaction model](../design/interaction-model.md); this ADR records only the
decision.

## Consequences

- **Revises approved requirements** (edited in place, citing this ADR):
  [FR-006](../requirements/functional/delay-control.md#fr-006-set-base-delay) range
  now includes `0` (live);
  [FR-014/015/016](../requirements/functional/live-mirror.md) and
  [US-008](../user-stories/index.md#us-008-live-mirrored-view) reframe Live as delay
  `0` reachable on either camera, the front/back switch as the camera button, and
  FR-016's suspend/resume as "a camera switch resets and re-ramps the buffer."
- **No dedicated mode-switch gesture is needed** — double-tap carries the live↔base
  toggle, spending no extra gesture.
- **Scrubbing toward live also corrects a too-long delay** — the forward bound of the
  scrub range doubles as the fix for problem 2.
- **One mechanism on both cameras** — the same buffer/scrub/pause machinery applies
  regardless of camera; "back-camera live" and "front-camera delayed" exist as free,
  if rarely useful, combinations.
- A camera switch resets the buffer and re-ramps the effective delay.

## Alternatives considered

- **Keep the two-mode model** (Delayed vs Live as distinct modes with suspend/resume).
  The original framing; rejected because it required an extra mode-switch gesture and
  offered no in-loop way to fix a wrong base delay.
- **Dedicated Live gesture** (e.g. two-finger tap) keeping double-tap as
  return-to-base. Rejected: once Live is just delay `0` on the same camera,
  overloading double-tap to toggle base↔live is cleaner and costs no extra gesture.
