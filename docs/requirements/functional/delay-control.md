---
id: req-delay-control
status: draft
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
The user SHALL be able to set the base delay within 5–180 seconds. Default is 60
seconds. *(Serves US-003)*

*Example: set 30s for an archery cycle.*

### FR-007 — Delay change takes effect immediately
Changing the base delay SHALL take effect immediately. If the new delay exceeds the
buffered footage, the effective delay ramps up to it (per FR-004). *(Serves US-003)*

*Example: raising the delay from 30s to 90s mid-session ramps up over the next minute.*

### FR-008 — Delay presets
The user SHALL be able to select a delay preset to apply its value. Presets persist
across sessions. Seeded presets: "Gym" (60s), "Archery" (30s). *(Serves US-004)*

*Example: tap "Archery" and the delay becomes 30s.*
