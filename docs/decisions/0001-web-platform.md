---
id: adr-0001
status: approved
---

# ADR 0001: Web platform

## Context

Hindsight runs on a phone propped on a tripod a few meters away. It needs live
front/rear camera access, a screen that stays awake, and a rolling in-memory video
buffer that is never persisted. It is a single-user personal tool, not a
store-distributed product. Continuous deployment was wanted from day one. Targets are
modern phones — **Android priority, iPhone also supported.**

The choice is between a **web app** running in the phone's browser and a **native
app** (e.g. Expo / React Native).

## Decision

Build Hindsight as a **web app**.

The browser provides everything the app needs — camera capture, an awake screen, and
in-memory buffering. A single-user tool gains nothing from store distribution, and a
git push to the host is live on the next page load, with no build, signing, or review
pipeline.

## Consequences

- **Zero-install, instant updates** — new versions reach the phone on the next load.
- **Camera access requires HTTPS** in production; `localhost` works in dev.
- **No app sandbox or gallery** to accidentally persist footage into, reinforcing the
  in-memory-only design.
- **Future native path stays open** — the core is plain TypeScript and could be
  wrapped (e.g. Capacitor) later if ever needed. Not built now (YAGNI).

## Alternatives considered

- **Native (Expo / React Native).** More capability headroom, but heavyweight for a
  single-user tool (EAS builds, dev clients or store submission), conflicts with
  day-one continuous deployment, and the hard problem (real-time frame buffering) is
  no easier there. Rejected.
