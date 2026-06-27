---
id: req-live-mirror
status: implemented
---

# Requirements — Live Mirror

A real-time view for watching oneself live like a mirror. Under the orthogonal model
([ADR-0010](../../decisions/0010-orthogonal-interaction-model.md)) "live" is not a
separate mode — it is the delay set to `0` (the forward edge of the buffer) — and the
front/back camera is an independent toggle. Serves
[US-008](../../user-stories/index.md#us-008-live-mirrored-view).

### FR-014 — Live view (delay 0)
The user SHALL be able to view a camera live with zero delay by setting the delay to
`0` (the live edge), on either camera. The front camera defaults to live.
*(Serves US-008; revised by [ADR-0010](../../decisions/0010-orthogonal-interaction-model.md))*

*Example: flip to the front camera, which opens live, to check posture in real time.*

### FR-015 — Mirroring follows the camera
The front camera view SHALL be mirrored (as a mirror would show), live or delayed;
the back camera SHALL NOT be mirrored (the observer's view, per FR-002). Mirroring is
a function of the camera, not the delay.
*(Serves US-008; revised by [ADR-0010](../../decisions/0010-orthogonal-interaction-model.md))*

*Example: on the front camera the user's right hand appears on the screen's right.*

### FR-016 — Switching camera resets the buffer
Switching the camera SHALL reset the buffer and re-ramp the effective delay up to the
target (per FR-004), since the new camera's stream starts an empty buffer.
*(Serves US-008; revised by [ADR-0010](../../decisions/0010-orthogonal-interaction-model.md))*
