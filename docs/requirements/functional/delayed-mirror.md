---
id: req-delayed-mirror
status: approved
---

# Requirements — Delayed Mirror

The primary mode: the screen continuously shows the rear-camera feed delayed by the
base delay, advancing in real time. Serves [US-001](../../user-stories/index.md#us-001-watch-myself-on-a-delay-hands-free)
and [US-002](../../user-stories/index.md#us-002-never-manage-files).

### FR-001 — Continuous delayed display
The app SHALL continuously capture the rear camera and display the feed delayed by
the base delay, advancing in real time — at any instant the screen shows the moment
`delay` seconds ago. *(Serves US-001)*

*Example: at a 60s delay, at 10:00:00 the screen shows what the camera saw at
09:59:00; at 10:00:01 it shows 09:59:01.*

### FR-002 — Delayed view shown un-mirrored
The delayed view SHALL be shown un-mirrored (as an observer across the room would
see the user). *(Serves US-001)*

*Example: the user's right hand appears on the screen's left, like a normal video of them.*

### FR-003 — No persistence
No footage SHALL be written to persistent storage. The buffer is in memory only and
is discarded when the app closes or resets. *(Serves US-002)*

*Example: closing the app leaves nothing in the photo gallery or filesystem.*

### FR-004 — Startup delay ramp
On startup and after a reset, before `delay` seconds of footage exist, the effective
delay SHALL ramp from 0 up to the base delay as the buffer fills; the screen shows
near-live until then. *(Serves US-001)*

*Example: open the app set to 60s; the user sees near-live immediately, and the
delay grows until it reaches the full 60s about a minute later.*

### FR-005 — Hands-free loop
The delayed loop SHALL run hands-free — once started, no interaction is required to
keep watching. *(Serves US-001)*
