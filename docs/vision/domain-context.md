---
id: domain-context
---

# Domain Context

Domain knowledge that shapes how the app should work, and the heuristics Claude
Code should apply when requirements are silent. See also the [Glossary](glossary.md).

## Domain Knowledge

- **The core is a continuous delayed loop, not a recording.** At any instant the
  screen equals the camera feed from `delay` seconds ago, advancing in real time.
  The user never starts or stops a clip; they just look at the screen when they
  want to see what they just did.
- **Ephemeral by design.** Footage exists only in a rolling in-memory buffer and
  is never saved. This is the whole point — it eliminates the file-management
  hassle of normal video.
- **Rewatch is about recent reps, not session history.** The user wants to
  re-study the last rep or two, repeatedly — not browse arbitrary earlier footage.
- **Activity duration drives the delay.** The delay is set so that by the time the
  user looks at the screen, their just-completed effort is playing. Gym sets run
  ~60–90s (delay ~60s); an archery cycle of position → shoot → watch is shorter
  (~30s).
- **Mirroring depends on the camera.** The rear camera films the user from across
  the room and is shown un-mirrored (as others see them). The front camera is a
  live mirror and is shown mirrored (as a real mirror would).
- **Two distinct viewing modes.** (1) Delayed replay — rear camera, delayed,
  un-mirrored. (2) Live mirror — front camera, zero delay, mirrored.

## Workflows & Constraints

- **Setup:** the user props the phone on a flexible (gorilla) tripod a few meters
  away, then trains.
- **Hands-free is paramount.** Between efforts the user should not need to touch
  the phone; the delayed loop plays on its own. Interaction during review is
  gesture-based.
- **Gesture vocabulary:** scrub back to rewatch, single tap to pause, double tap
  to return to the base delay.
- **Legibility at distance.** The screen must be readable from a few meters in a
  gym environment.
- **Distraction-free.** The UI should be minimal — mostly the video, with controls
  expressed as gestures rather than persistent on-screen buttons.

## Implementation Heuristics

When facing ambiguous decisions, apply these guidelines:

| Situation | Do this | Not this |
|-----------|---------|----------|
| Showing the delayed feed | Always advance in real time (live-minus-delay) | Freeze, restart, or replay fixed segments |
| Buffer not yet full | Ramp the effective delay up from live | Block or hide the screen until it fills |
| User finishes rewatching a moment | Wait for a double-tap to re-sync to base delay | Auto-jump back to base delay on its own |
| Rendering the rear camera | Show un-mirrored | Mirror it |
| Rendering the front camera | Mirror it, zero delay | Apply any delay |
| Handling any footage | Keep in memory only | Persist to storage or the gallery |
| Showing controls | Gestures, transient/fading affordances | Persistent on-screen buttons cluttering the view |
