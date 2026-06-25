---
id: adr-0011
status: approved
---

# ADR 0011: Random-access playback via keyframe seek

## Context

[ADR-0009](0009-delayed-playback-buffer.md) chose a WebCodecs in-memory buffer and
anticipated displaying a moment by "choosing which buffered chunk to decode." The
Feature 1 tracer implemented the simplest thing that worked for a *fixed* delay: a
sequential FIFO that decodes every chunk in order, paced by wall-clock, and discards
each chunk once displayed.

That model cannot serve an *arbitrary* display position. Changing the base delay
([FR-007](../requirements/functional/delay-control.md#fr-007-delay-change-takes-effect-immediately))
or scrubbing ([FR-009](../requirements/functional/playback.md#fr-009-horizontal-drag-scrubs-the-buffer))
means jumping to a different point in the buffer, and an inter-frame codec can only
start decoding from a keyframe. The sequential FIFO has no seek and has already
discarded history, so a jump either floods the decoder (large decrease) or freezes
(large increase). Delay control and scrub are the **same problem**: move the display
to an arbitrary buffered time.

## Decision

Replace the sequential-drain FIFO with a **retained ring buffer + read cursor +
seek-to-keyframe decode**:

- Encoded chunks are kept in a bounded ring buffer ([`TimedRingBuffer`](../../src/timedRingBuffer.ts))
  up to the retention window (delay + rewatch headroom, capped — see
  [OQ-2](../open-questions.md#oq-2-buffer-window-and-rewatch-headroom)), not drained
  at the display point. Each chunk records whether it is a keyframe.
- A **read cursor** holds the target display time (`now − effectiveDelay`, or a scrub
  position).
- To show the cursor's frame, **seek** to the nearest keyframe at or before the
  cursor and decode forward to it, then resume real-time sequential decode from there.
- A delay change or a scrub is just a cursor move; both reuse the same seek.

This builds on ADR-0009 (the WebCodecs choice stands); it specifies the playback
engine inside it and supersedes the tracer's FIFO.

## Consequences

- **Delay control (Feature 2) and scrub (Feature 3) share one mechanism**, built once
  instead of twice.
- **Instant, smooth delay preview both directions** — no flush/re-ramp, so dialing the
  wheel previews the result live (the agreed UX).
- **Memory is bounded by the retention window**, per OQ-2; the `TimedRingBuffer`
  (built earlier, until now unused) is wired in here.
- **Requires keyframe indexing** in the buffer and a decode-forward-to-target step
  (intermediate frames are decoded but not shown). More complex than the FIFO.
- The startup ramp ([FR-004](../requirements/functional/delayed-mirror.md#fr-004-startup-delay-ramp))
  still falls out naturally: the cursor is clamped to the oldest buffered frame while
  the buffer fills.

## Alternatives considered

- **Keep the sequential FIFO; handle delay change by flush + re-ramp from near-live.**
  Rejected: it drops to near-live and ramps back on every change, killing the
  live-preview UX, and scrub would still need seek later — duplicated work.
- **Decode all frames and keep decoded (raw) frames addressable.** Rejected for the
  ADR-0009 reason: raw frames cannot hold a multi-minute window in memory.
