---
id: open-questions
---

# Open Questions

Items requiring future discussion or refinement. These should NOT block MVP
implementation.

## Implementation-Time Decisions

| ID | Question | When to Decide | Notes |
|----|----------|----------------|-------|
| OQ-I3 | Orientation: support both vs lock to one | After trying the propped setup | NFR-006 assumes both |

## Resolved Questions

### OQ-1: Mode-switch gesture
Obsoleted by [ADR-0010](decisions/0010-orthogonal-interaction-model.md): there is no
mode switch. Camera (front/back) is an independent toggle button, and a double-tap
toggles live↔base on the delay axis. No dedicated switching gesture is needed.

### OQ-2: Buffer window and rewatch headroom
**Resolved:** the buffer is derived, not user-set. `buffer = base delay + 60s`
rewatch headroom, capped at 300s. The cap follows the memory budget: at the measured
~0.7 MB/s, 300s ≈ 210 MB, the safe ceiling before iOS reclaims the app. Base delay
therefore caps at 240s (240 + 60 = 300). Lowering the encoder bitrate can extend the
window if ever needed (a quality trade-off). See
[FR-006](requirements/functional/delay-control.md#fr-006-set-base-delay).

### OQ-3: Custom preset management
**Resolved:** presets are fully user-customizable (no seed). The user saves the
current wheel value as a labeled preset via a `+` chip, applies one with a tap
(which closes settings), and removes one with a long-press confirm. Persisted to
localStorage. See [FR-008](requirements/functional/delay-control.md#fr-008-delay-presets).

### OQ-I1: Scrub gesture sensitivity
**Resolved:** relative-delta mapping at ~20s of footage per screen-width; only the
frame under the finger is drawn (coalesced seeks). Tunable per device.

### OQ-I2: Startup ramp indicator
**Resolved:** an honest full-screen countdown overlay ("Replay in Ns") over live
video while the delay builds, collapsing to the delay pill once warmed.
