---
id: req-delay-control
status: implemented
---

# Requirements — Delay Control

The user sets how far behind live the delayed mirror runs, optionally via presets.
Serves [US-003](../../user-stories/index.md#us-003-tune-the-delay) and
[US-004](../../user-stories/index.md#us-004-delay-presets).

**Delay Preset properties:**

| Property | Required | Description | Example |
|----------|----------|-------------|---------|
| label | Yes | Display name for the preset | "Gym" |
| delaySeconds | Yes | Delay the preset applies | 60 |

### FR-006 — Set base delay
The user SHALL be able to set the base delay to live (`0`) or from 5 to 240 seconds in
5-second steps. Default is 20 seconds. A base delay of `0` is the live edge of the
buffer (no delay). The buffer retained is derived, not set by the user: `base delay +
60s` rewatch headroom, capped at 300s (~210 MB) — see
[OQ-2](../../open-questions.md#oq-2-buffer-window-and-rewatch-headroom).
*(Serves US-003; revised by [ADR-0010](../../decisions/0010-orthogonal-interaction-model.md))*

*Example: set 30s for an archery cycle; set 0 (live) to use the camera as a plain mirror.*

### FR-007 — Delay change takes effect immediately
Changing the base delay SHALL take effect immediately. If the new delay exceeds the
buffered footage, the effective delay ramps up to it (per FR-004). *(Serves US-003)*

*Example: raising the delay from 30s to 90s mid-session ramps up over the next minute.*

### FR-008 — Delay presets
The user SHALL be able to save the current delay as a preset (optionally labeled),
apply a preset with a tap, and remove a preset. Presets persist across sessions; there
are no seeded defaults. *(Serves US-004)*

*Example: save the current 30s as "Archery", then tap it later to set the delay to 30s.*
