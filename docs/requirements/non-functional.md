---
id: req-non-functional
status: implemented
---

# Requirements — Non-functional

Cross-cutting behavior for a distraction-free, gym-usable tool. Serves
[US-009](../../user-stories/index.md#us-009-minimal-distraction-free-gesture-driven-ui)
and supports the core hands-free experience.

### NFR-001 — Minimal, distraction-free UI
The UI SHALL be minimal and distraction-free — the video fills the screen and
controls are not persistently visible. *(Serves US-009)*

### NFR-002 — Gesture-based controls
Controls SHALL be primarily gesture-based (see [Playback](functional/playback.md)).
*(Serves US-009)*

### NFR-003 — Glanceable, legible at distance
Current state (delay, mode) SHALL be glanceable and legible from a few meters away.
*(Serves US-009)*

*Example: the active delay is briefly shown large when changed, then fades.*

### NFR-004 — Screen stays awake
The screen SHALL stay awake while the app is active. *(Serves US-001)*

### NFR-005 — No audio
No audio SHALL be captured. *(Serves US-002)*

### NFR-006 — Orientation
The app SHALL work in both portrait and landscape, adapting the view to how the
phone is propped. *(Serves US-001)*
