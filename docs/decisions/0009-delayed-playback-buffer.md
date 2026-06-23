---
id: adr-0009
status: approved
---

# ADR 0009: Delayed playback via WebCodecs

## Context

The core of Hindsight ([FR-001](../requirements/functional/delayed-mirror.md#fr-001-continuous-delayed-display))
is a continuous delayed display: the screen shows the rear camera as it was `delay`
seconds ago, advancing in real time, with scrub-back
([FR-009](../requirements/functional/playback.md#fr-009-horizontal-drag-scrubs-the-buffer))
and a startup ramp ([FR-004](../requirements/functional/delayed-mirror.md#fr-004-startup-delay-ramp)).
The buffer is in memory only ([FR-003](../requirements/functional/delayed-mirror.md#fr-003-no-persistence)),
so it must hold **compressed** video (raw frames cannot reach a multi-minute window).
The target is modern phones — **Android priority, iPhone also supported** — so the
technique is gated by what those browsers provide:

| Technique | Chrome for Android | iOS Safari |
|-----------|--------------------|------------|
| WebCodecs video (`VideoEncoder`/`VideoDecoder`/`VideoFrame`) | Supported | Full in Safari 26; video interfaces since 16.4 |
| MediaSource (MSE) | Supported | iPhone only via ManagedMediaSource (Safari 17.1+), and only with an AirPlay source alternative or remote playback disabled |

We need only the **video** interfaces (no audio), which both platforms provide.
ManagedMediaSource's constraints make MSE an awkward fit for a self-view app.

## Decision

Use **WebCodecs** as the single in-memory delayed-buffer pipeline on both platforms:
encode camera frames with `VideoEncoder` into a bounded ring buffer of
`EncodedVideoChunk`s, and decode the chunk for the desired moment with `VideoDecoder`
for display. **MSE, MediaRecorder, and ManagedMediaSource are not used.**

The one platform-specific part is obtaining `VideoFrame`s from the camera, isolated
behind a `FrameSource` interface: `MediaStreamTrackProcessor` on Chrome/Android, a
`<video>` + `requestVideoFrameCallback` fallback on Safari (which lacks it).
Everything downstream is identical.

## Consequences

- **One technique, both platforms** — no MSE/codec divergence; the only platform
  branch is the `FrameSource` capture step.
- **Frame-accurate scrub and startup ramp** fall out of choosing which buffered chunk
  to decode.
- **Bounded, tunable memory.** Eviction is keyed off the buffer window; both the window
  and the encoder bitrate are config (not magic numbers), because memory scales with
  the window. Exact sizing is open ([OQ-2](../open-questions.md)).
- **Firefox mobile is unsupported** — an accepted limitation (no
  `MediaStreamTrackProcessor`, incomplete WebCodecs encode).

## Alternatives considered

- **MediaRecorder + MediaSource (MSE).** More legacy prior art, but on iPhone it
  requires ManagedMediaSource with its AirPlay/remote-playback constraints and would
  split the pipeline by platform. Rejected in favor of a single WebCodecs path.
- **Canvas raw-frame ring buffer.** Cannot hold a multi-minute window in memory. Rejected.
