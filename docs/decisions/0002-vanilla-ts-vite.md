---
id: adr-0002
status: approved
---

# ADR 0002: Vanilla TypeScript + Vite, no UI framework

## Context

On the [web platform](0001-web-platform.md), the app needs a language, a build tool,
and (optionally) a UI framework. Evaluation priorities for Claude Code-assisted work,
in order: Claude Code effectiveness, maturity/stability, simplicity, TypeScript
support, debuggability.

The decisive fact is the app's shape: Hindsight has almost no UI tree. It is one
full-screen view, a few gesture handlers, and a small fading text overlay. The hard
90% is an **imperative, real-time loop** — capture the camera, push into a rolling
buffer, render the frame from `delay` seconds ago, scrub/pause on gesture. That is
direct media-API and timing work, not declarative view composition.

## Decision

- **Language:** TypeScript.
- **Build tool / dev server:** Vite.
- **UI framework:** none — vanilla DOM + media APIs.

## Consequences

- **Best debuggability for the part that bites.** A stack trace runs through our own
  playback/buffer code, not a framework scheduler — essential when the delay drifts.
- **No render cycle fighting the loop.** A framework's re-renders would compete with
  the imperative timing loop; we would push everything into refs/effects to bypass it.
- **Smallest dependency surface** — fewer moving parts, faster cold builds.
- **Claude Code effectiveness is unaffected** — the corpus that matters here is plain
  browser API (`getUserMedia`, WebCodecs, canvas), equally strong without a framework.
- **Trade-off:** if real UI screens appear later (settings, a preset editor), there is
  no component model. **Svelte** is the natural upgrade then (lean output, clean
  imperative escape hatches). YAGNI for now.

## Alternatives considered

- **React + Vite.** Largest training corpus, but heaviest for a single imperative
  view; most logic would live in `useRef`/`useEffect` to dodge re-renders. Rejected.
- **Svelte + Vite.** A good middle ground — light reactivity, lean output. Rejected
  for v1 only because there is virtually no reactive UI to justify it; noted as the
  upgrade path if the UI grows.
