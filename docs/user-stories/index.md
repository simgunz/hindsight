---
id: user-stories
status: implemented
---

# User Stories

What the user wants and why. Each story has a stable ID (`US-NNN`); requirements
trace back to these IDs. For the raw idea behind them, see [Idea](../vision/idea.md).

## Persona

**Primary user:** a solo athlete reviewing their own form (e.g. gym lifter, archer).

- Trains alone, with no partner to film or give feedback.
- Hands are occupied or chalky; can't be tapping a phone between efforts.
- Props the phone on a flexible (gorilla) tripod, a few meters away.
- Comfortable with phone apps; wants the tool to disappear into the background.

**Current workaround:** films a normal video, then has to stop it, open the
gallery, watch it, and delete it.

## Status

| ID | Story | Area | Priority | Status |
|----|-------|------|----------|--------|
| US-001 | Watch myself on a delay, hands-free | Delayed mirror | Essential | implemented |
| US-002 | Never manage files | Delayed mirror | Essential | implemented |
| US-003 | Tune the delay | Delay control | Important | implemented |
| US-004 | Delay presets | Delay control | Nice-to-have | implemented |
| US-005 | Scrub back to rewatch | Playback | Important | implemented |
| US-006 | Single tap to pause | Playback | Important | implemented |
| US-007 | Double tap to return to base delay | Playback | Important | implemented |
| US-008 | Live mirrored view | Live mirror | Nice-to-have | implemented |
| US-009 | Minimal, distraction-free, gesture-driven UI | Experience | Essential | implemented |

## Delayed Mirror

### US-001 — Watch myself on a delay, hands-free
**As an** athlete training alone, **I want** the phone to continuously show me on a
fixed delay, **so that** I can finish an exercise, look at the screen, and watch my
own form without touching the phone.

*Example: with a 60s delay, I finish a squat set, walk over to the propped phone,
and watch the set replay automatically while I catch my breath.*

### US-002 — Never manage files
**As an** athlete, **I want** nothing to be recorded or saved, **so that** I never
have to open a gallery or delete clips — it's a live rolling loop only.

*Example: after a workout I just close the app; there are no videos to clean up.*

## Delay Control

### US-003 — Tune the delay
**As an** athlete, **I want** to adjust the delay length, **so that** it matches how
long my activity takes before I want to review it.

*Example: a gym set runs 60–90s so I set ~60s; an archery cycle is shorter so I set ~30s.*

### US-004 — Delay presets
**As an** athlete, **I want** preset delay values I can pick quickly, **so that** I
don't re-dial the delay every time I switch activity.

*Example: I tap a "Gym 60s" or "Archery 30s" preset instead of adjusting manually.*

## Playback

### US-005 — Scrub back to rewatch
**As an** athlete, **I want** to scrub backward with a gesture and rewatch a moment,
repeatedly, **so that** I can study a specific part of my form more than once.

*Example: I want to see the bottom of my squat again, so I swipe back to it and
watch it a few times.*

### US-006 — Single tap to pause
**As an** athlete, **I want** a single tap to pause the playback, **so that** I can
freeze on a moment and study my position.

*Example: I tap once to hold the frame at my release point in archery.*

### US-007 — Double tap to return to base delay
**As an** athlete, **I want** a double tap to snap back to the base delay, **so that**
I can leave rewatch mode and resume the normal delayed loop in one gesture.

*Example: after rewatching a rep a few times, I double-tap and the screen is back
to showing me 60s behind live.*

## Live Mirror

### US-008 — Live mirrored view
**As an** athlete, **I want** to see myself live with no delay (front camera
mirrored), **so that** I can watch myself in real time like a mirror.

*Example: I flip to the front camera, see a live mirrored view of myself while
moving, then double-tap to jump to the delayed review of the set I just did.*

## Experience

### US-009 — Minimal, distraction-free, gesture-driven UI
**As an** athlete mid-workout, **I want** a clean, minimal interface controlled
mostly by gestures, **so that** the tool stays out of my way and is readable from a
few meters in a gym.

*Example: the screen is mostly just my video; controls are gestures rather than
visible buttons cluttering the view.*
