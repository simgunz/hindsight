---
id: adr-0008
status: approved
---

# ADR 0008: localStorage for settings persistence

## Context

A small amount of state persists between sessions: the base delay and the seeded
presets ([FR-008](../requirements/functional/delay-control.md#fr-008-delay-presets)).
No footage is ever persisted
([FR-003](../requirements/functional/delayed-mirror.md#fr-003-no-persistence)).

## Decision

Persist settings in **localStorage**.

It is synchronous, trivial to use, and well-suited to a handful of small key-values.

## Consequences

- Dead-simple reads/writes for base delay and presets; no async or schema overhead.
- Kept separate from the video pipeline, so persistence never touches the buffer.

## Alternatives considered

- **IndexedDB.** Built for large or structured data; overkill for a few key-values. Rejected.
