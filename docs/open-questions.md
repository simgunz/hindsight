---
id: open-questions
---

# Open Questions

Items requiring future discussion or refinement. These should NOT block MVP
implementation.

## Pending Design Decisions

### OQ-1: Mode-switch gesture
**Context:** The app has two modes — delayed rear mirror and live front mirror.
Phase 1 left the switching mechanism open.

**Question:** How does the user switch between delayed-rear and live-front?

**Options to explore:**
- A dedicated edge gesture (e.g. two-finger swipe or swipe up)
- A small, fading control in a corner
- A vertical drag (reserving horizontal drag for scrubbing)

**Status:** To be decided during implementation (interaction design).

### OQ-2: Buffer window and rewatch headroom
**Context:** Scrubbing back reaches the oldest footage in the buffer. The behavioral
need is "rewatch recent reps," not full session history. Exact numbers affect memory use.

**Question:** How much footage does the buffer retain beyond the current delay?

**Options discussed:**
- Retain `delay` + a fixed rewatch headroom (proposed default: 60s headroom)
- Hard cap on total buffer (proposed default: ~5 minutes) to bound memory

**Decision (preliminary):** Buffer = current delay + 60s headroom, capped at ~5 min;
tune per device during Phase 4.

**Status:** To be confirmed during implementation (device memory testing).

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

*(none yet)*
