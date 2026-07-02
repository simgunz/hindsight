---
id: req-reference-guides
status: approved
---

# Requirements — Reference Guides

Persistent on-screen reference overlays (lines and points) the user places to check
form alignment against a fixed reference. Serves
[US-011](../../user-stories/index.md#us-011-mark-reference-lines-and-points-on-the-view)
and [US-012](../../user-stories/index.md#us-012-adjust-hide-and-keep-my-reference-guides).

> **Status:** `approved` — signed off, ready to implement.

**Design note — a deliberate visible control.** Guides intentionally introduce the
app's first persistent on-screen button — a considered exception to the gesture-first
principle ([NFR-002](../non-functional.md)). Guides are used occasionally and must be
discoverable; hiding their entry behind a gesture would make them undiscoverable. The
button stays a single small icon to preserve the minimal, glanceable view
([NFR-001](../non-functional.md)).

### FR-020 — Reference line via two taps
A reference line SHALL be created by two taps: the first tap sets one endpoint, the
second sets the other; the guide is the straight segment between the two points.
*(Serves US-011)*

*Example: tap the top of the bar's path, then the bottom, and a line is drawn between them.*

### FR-021 — Reference point via a single tap
A reference point SHALL be created by a single tap, placed at the tapped location.
*(Serves US-011)*

*Example: tap where the bow anchor sits to mark it for the next shot.*

### FR-022 — Angle snapping with lock indicator
While a line is being placed or adjusted, when its angle is within a small threshold
of true vertical or horizontal it SHALL snap to exactly vertical/horizontal. A visible
lock indicator SHALL distinguish a snapped line from a merely near-vertical one.
Snapping constrains the angle only; line length remains the segment between the user's
two points. *(Serves US-011)*

*Example: a roughly top-to-bottom tap becomes a perfect plumb line, so bar drift is
obvious at a glance without precise tapping.*

### FR-023 — Guides are screen-space overlays
Guides SHALL render as an overlay in screen space, independent of the video content,
so they are unaffected by camera mirroring or by which view (delayed or live) is
shown. *(Serves US-011)*

*Example: a plumb line stays vertical on screen whether the delayed (un-mirrored) or
live (mirrored) view is active.*

### FR-024 — Placement suspends canvas gestures
While a guide is being placed, the canvas pause/scrub/double-tap gestures SHALL be
suspended so taps set guide vertices; normal gestures SHALL resume once placement
completes or is cancelled. *(Serves US-011)*

### FR-025 — Select, move, and delete individual guides
The user SHALL be able to select a placed guide and: move it (drag an endpoint to
adjust a line's angle/length with snapping re-applied, or drag the whole guide to
reposition it), and delete that individual guide. *(Serves US-012)*

### FR-026 — Show/hide all guides
The user SHALL be able to hide all guides and show them again without deleting them.
*(Serves US-012)*

*Example: hide the plumb line to watch a clean rep, then show it again to compare.*

### FR-027 — Clear all guides
The user SHALL be able to remove all guides at once. *(Serves US-012)*

### FR-028 — Guides persist across resume and restart
Placed guides SHALL persist across resume from pause and across app restarts
(localStorage). Guides SHALL NOT be bound to delay presets. *(Serves US-012)*

*Rationale: body and phone position vary between sessions, so re-placing a guide from
any frame is preferred over auto-restoring it against a preset. Preset-binding may be
revisited later.*

### FR-029 — Guides control surface
Guides SHALL be reachable from a single persistent on-screen button that opens a
compact guide bar (add line, add point, show/hide all, clear all). A first-run
coachmark SHALL point at the button for discoverability. *(Serves US-011, US-012)*
