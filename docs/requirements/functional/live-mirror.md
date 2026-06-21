---
id: req-live-mirror
status: approved
---

# Requirements — Live Mirror

A real-time mirrored view from the front camera, for watching oneself live like a
mirror. Serves [US-008](../../user-stories/index.md#us-008-live-mirrored-view).

### FR-014 — Live front-camera view
The user SHALL be able to switch to a live front-camera view with zero delay.
*(Serves US-008)*

*Example: switch to the front camera to check posture in real time.*

### FR-015 — Live view is mirrored
The live front-camera view SHALL be mirrored (as a mirror would show). *(Serves US-008)*

*Example: the user's right hand appears on the screen's right.*

### FR-016 — Switching modes suspends/resumes the loop
Switching to the live mirror SHALL suspend the delayed loop; switching back to the
delayed mirror SHALL resume it, ramping the effective delay up again (per FR-004).
*(Serves US-008)*
