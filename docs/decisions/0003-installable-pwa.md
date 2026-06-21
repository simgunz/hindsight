---
id: adr-0003
status: approved
---

# ADR 0003: Installable PWA with an offline app shell

## Context

The view must be distraction-free and fullscreen
([NFR-001](../requirements/non-functional.md#nfr-001-minimal-distraction-free-ui)),
and the tool is opened repeatedly at the gym where connectivity can be poor. On the
[web platform](0001-web-platform.md), a plain web page cannot achieve a chrome-free
fullscreen view on iPhone: iOS Safari grants true fullscreen only to `<video>`
elements, not arbitrary app UI, so Safari's chrome always remains.

## Decision

Ship Hindsight as an **installable PWA** running in **standalone display mode**, with
an **offline app shell**.

- "Add to Home Screen" in standalone mode is the only way to hide browser chrome on
  iPhone, and it gives a home-screen icon for a repeatedly-opened tool. On Android it
  delivers the same chrome-free launch.
- The app needs no network at runtime (the camera is local), so a service worker
  caching the app assets lets it launch on poor connectivity at no real cost.

Implemented with **vite-plugin-pwa** (web app manifest + generated service worker),
which fits the [Vite](0002-vanilla-ts-vite.md) build.

## Consequences

- **Chrome-free fullscreen on both platforms** via standalone display mode.
- **Launches offline** once installed — resilient to gym wifi.
- A small manifest plus a generated service worker; minimal added surface.

## Alternatives considered

- **Plain web page (Fullscreen API only).** Works on Android, but cannot hide Safari
  chrome on iPhone for non-`<video>` UI, failing the distraction-free requirement
  there. Rejected.
