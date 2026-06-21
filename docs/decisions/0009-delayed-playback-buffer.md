---
id: adr-0009
status: proposed
---

# ADR 0009: Delayed playback via WebCodecs

## Context

The core of Hindsight ([FR-001](../requirements/functional/delayed-mirror.md#fr-001-continuous-delayed-display))
is a continuous delayed display: at any instant the screen shows the rear camera as
it was `delay` seconds ago, advancing in real time, with scrub-back
([FR-009](../requirements/functional/playback.md#fr-009-horizontal-drag-scrubs-the-buffer)),
pause ([FR-011](../requirements/functional/playback.md#fr-011-single-tap-toggles-pauseresume)),
and a startup ramp ([FR-004](../requirements/functional/delayed-mirror.md#fr-004-startup-delay-ramp)).
The buffer is in memory only ([FR-003](../requirements/functional/delayed-mirror.md#fr-003-no-persistence))
and bounded (roughly base delay plus rewatch headroom, capped near 5 minutes).

Raw frames cannot reach a multi-minute window in memory, so the buffer must hold
**compressed** video. The target is modern phones — **Android is the priority, with
iPhone also supported.** The technique choice is gated by what those browsers support.

Current support (researched June 2026):

| Technique | Chrome for Android | iOS Safari |
|-----------|--------------------|------------|
| WebCodecs video (`VideoEncoder`/`VideoDecoder`/`VideoFrame`) | Supported | Full in Safari 26; video interfaces present since 16.4 |
| MediaSource (MSE) | Supported | iPhone only via ManagedMediaSource (Safari 17.1+), and only with an AirPlay source alternative or remote playback disabled |

We need only the **video** interfaces (no audio), which both platforms provide on
modern phones. ManagedMediaSource's constraints make it an awkward fit for a
self-view app.

## Decision

Use **WebCodecs** as the single delayed-playback pipeline on both platforms:

- `getUserMedia` → a stream of `VideoFrame`s → `VideoEncoder` → an **in-memory ring
  buffer of `EncodedVideoChunk`s**, bounded to the configured buffer window (oldest
  chunks evicted).
- Playback decodes the chosen buffered chunk with `VideoDecoder` and draws the
  resulting `VideoFrame` to a `<canvas>`. The displayed position is `liveEdge -
  effectiveDelay`; scrub maps drag to that offset, and the startup ramp is
  `effectiveDelay` growing from 0 to base as the buffer fills.
- Mirroring (rear un-mirrored [FR-002](../requirements/functional/delayed-mirror.md#fr-002-delayed-view-shown-un-mirrored),
  front mirrored [FR-015](../requirements/functional/live-mirror.md#fr-015-live-view-is-mirrored))
  is a canvas transform at draw time.

**MSE, MediaRecorder, and ManagedMediaSource are not used.**

### The one platform seam: frame capture

Obtaining `VideoFrame`s from the camera differs by browser, so it sits behind a
small `FrameSource` interface with two implementations:

- **Android / Chrome:** `MediaStreamTrackProcessor` — a readable stream of `VideoFrame`s.
- **iOS / Safari:** a `<video>` element with `requestVideoFrameCallback`, wrapping
  each frame as `new VideoFrame(videoEl)` (Safari does not implement
  `MediaStreamTrackProcessor`).

Everything downstream (encode → ring buffer → decode → render) is identical code.

## Consequences

- **One technique, both platforms** — no MSE/codec divergence; the only branch is the
  `FrameSource` capture step.
- **Frame-accurate scrub and ramp** fall out of choosing which buffered chunk to decode.
- **Bounded memory** via chunk eviction keyed off the configured window (a config
  value, not a magic number).
- **Status is `proposed`, not `approved`:** WebCodecs encoder throughput and end-to-end
  latency at ~30fps on a real device are unproven. The Phase 4 walking skeleton MUST
  spike this pipeline on an actual target phone (Android first, then iPhone) before
  the rest of the app is built on it.

## Alternatives considered

- **MediaRecorder + MediaSource (MSE).** More legacy prior art, but on iPhone it
  requires ManagedMediaSource with its AirPlay/remote-playback constraints, and it
  would split the pipeline by platform. Rejected in favor of a single WebCodecs path.
- **Canvas raw-frame ring buffer.** Cannot hold a multi-minute window in memory. Rejected.
