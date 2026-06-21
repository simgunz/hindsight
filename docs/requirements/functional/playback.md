---
id: req-playback
status: draft
---

# Requirements — Playback Interaction

Gestures to rewatch and control the delayed playback. Controls are gestures, not
persistent buttons. Serves [US-005](../../user-stories/index.md#us-005-scrub-back-to-rewatch),
[US-006](../../user-stories/index.md#us-006-single-tap-to-pause), and
[US-007](../../user-stories/index.md#us-007-double-tap-to-return-to-base-delay).

### FR-009 — Horizontal drag scrubs the buffer
A horizontal drag SHALL scrub the playback position within the buffer; on release,
playback continues forward at normal speed from that position. *(Serves US-005)*

*Example: drag back to the bottom of the squat, release, and watch it play forward from there.*

### FR-010 — Repeatable rewatch
The user SHALL be able to scrub back repeatedly to rewatch the same moment multiple
times. *(Serves US-005)*

*Example: rewatch the same rep three times by scrubbing back each time.*

### FR-011 — Single tap toggles pause/resume
A single tap SHALL toggle pause/resume; while paused the current frame is held.
*(Serves US-006)*

*Example: tap to freeze on the release point, tap again to resume.*

### FR-012 — Double tap returns to base delay
A double tap SHALL return playback to the base delay (re-sync to live-minus-`delay`).
*(Serves US-007)*

*Example: after rewatching, double-tap and the screen is back to showing the user
60s behind live.*

### FR-013 — Scrubbing is bounded
Scrubbing SHALL be bounded — it cannot go earlier than the oldest footage in the
buffer, nor later than the present (live). *(Serves US-005)*
