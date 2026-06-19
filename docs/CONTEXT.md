# Hindsight — Domain Context

**Last Updated:** 2026-06-19

Domain knowledge and context captured during discovery. This document is started in Phase 1 (brain dump) and refined in Phase 2 (requirements formalization).

---

## Glossary

| Term | Definition |
|------|------------|
| Delayed mirror | The core mode: the screen continuously shows the camera feed from a fixed number of seconds ago, looping in real time. |
| Delay | How many seconds behind live the displayed image is. |
| Base delay | The currently configured delay the loop returns to after rewatching (e.g. via double-tap). |
| Buffer | The rolling window of recent footage held in memory to enable the delay and scrubbing. Never written to storage. |
| Preset | A saved delay value for quick selection (e.g. "Gym 60s", "Archery 30s"). |
| Scrub | Moving the playback position backward through the buffer with a gesture to rewatch a moment. |
| Live mirror | A real-time, mirrored front-camera view with no delay. |

---

## Domain Knowledge

- **The core is a continuous delayed loop, not a recording.** At any instant the screen equals the camera feed from `delay` seconds ago, advancing in real time. The user never starts or stops a clip; they just look at the screen when they want to see what they just did.
- **Ephemeral by design.** Footage exists only in a rolling in-memory buffer and is never saved. This is the whole point — it eliminates the file-management hassle of normal video.
- **Rewatch is about recent reps, not session history.** The user wants to re-study the last rep or two, repeatedly — not browse arbitrary earlier footage.
- **Activity duration drives the delay.** The delay is set so that by the time the user looks at the screen, their just-completed effort is playing. Gym sets run ~60–90s (delay ~60s); an archery cycle of position → shoot → watch is shorter (~30s).
- **Mirroring depends on the camera.** The rear camera films the user from across the room and is shown un-mirrored (as others see them). The front camera is a live mirror and is shown mirrored (as a real mirror would).
- **Two distinct viewing modes.** (1) Delayed replay — rear camera, delayed, un-mirrored. (2) Live mirror — front camera, zero delay, mirrored.

---

## Workflows & Constraints

- **Setup:** the user props the phone on a flexible (gorilla) tripod a few meters away, then trains.
- **Hands-free is paramount.** Between efforts the user should not need to touch the phone; the delayed loop plays on its own. Interaction during review is gesture-based.
- **Gesture vocabulary so far:** scrub back to rewatch, single tap to pause, double tap to return to the base delay.
- **Legibility at distance.** The screen must be readable from a few meters in a gym environment.
- **Distraction-free.** The UI should be minimal — mostly the video, with controls expressed as gestures rather than persistent on-screen buttons.

---

## Implementation Heuristics

*Added during Phase 2 refinement.*

| Situation | Do this | Not this |
|-----------|---------|----------|
| | | |
