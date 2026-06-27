---
id: req-onboarding
status: implemented
---

# Requirements — Onboarding

How a first-time user learns the gesture vocabulary and re-finds it later. The app is
almost entirely gesture-driven (see [NFR-002](../non-functional.md)), so the gestures
must be taught and remain discoverable. Serves
[US-010](../../user-stories/index.md#us-010-learn-the-gestures).

### FR-017 — First-run gesture walkthrough
On first launch the app SHALL present a one-time, skippable walkthrough of the core
gestures (swipe-up, double-tap, tap, drag) with animated cues, over the live camera.
It SHALL NOT compete with the startup or delay-building states: the first session
opens at live (zero delay) so the buffer fills behind the walkthrough with no
countdown, and the base delay is applied once it is dismissed. *(Serves US-010)*

*Example: on first launch I see myself live with a staged "swipe up / double-tap /
tap / drag" guide; by the time I finish, my delay is already built.*

### FR-018 — Persistent gesture discoverability
A persistent, unobtrusive on-screen affordance SHALL indicate that swiping up opens
settings — the gateway to delay, presets, and the gesture reference — so the controls
stay discoverable without cluttering the canvas. *(Serves US-010; NFR-001)*

*Example: a faint handle at the bottom edge hints that I can pull up for settings.*

### FR-019 — In-app gesture reference
The settings sheet SHALL offer a gesture reference reachable at any time — a scannable
list of the gestures and the camera button — and SHALL allow replaying the
walkthrough. *(Serves US-010)*

*Example: I forget how to reach live, so I swipe up, tap "?", and read the gesture
list; a "Replay walkthrough" option re-runs the guide.*
