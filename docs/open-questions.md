---
id: open-questions
---

# Open Questions

Items requiring future discussion or refinement. These should NOT block MVP
implementation.

## Pending Design Decisions

### OQ-3: Custom preset management
**Context:** v1 seeds "Gym 60s" and "Archery 30s" presets ([FR-008](requirements/functional/delay-control.md#fr-008-delay-presets)).
The user said presets were a "possible" nice-to-have.

**Question:** Can the user add/edit/remove presets, or are presets seeded-only in v1?

**Options to explore:**
- Seeded presets only (simplest)
- Editable preset list

**Status:** Deferred — seeded-only unless the user wants editing.

## Implementation-Time Decisions

| ID | Question | When to Decide | Notes |
|----|----------|----------------|-------|
| OQ-I1 | Scrub gesture sensitivity / pixels-to-seconds mapping | First playback prototype | Tune by feel |
| OQ-I2 | Startup ramp indicator (how to signal delay is still growing) | Building the delayed loop | Keep subtle, distraction-free |
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
