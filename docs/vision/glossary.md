---
id: glossary
---

# Glossary

Shared terms used across the vision, stories, and requirements.

| Term | Definition |
|------|------------|
| Delayed mirror | The core mode: the screen continuously shows the camera feed from a fixed number of seconds ago, looping in real time. |
| Delay | How many seconds behind live the displayed image is. |
| Base delay | The currently configured delay the loop returns to after rewatching (e.g. via double-tap). |
| Effective delay | The delay actually in effect right now. Equals the base delay once the buffer has filled; ramps up from 0 while it is still filling. |
| Buffer | The rolling window of recent footage held in memory to enable the delay and scrubbing. Never written to storage. |
| Preset | A saved delay value for quick selection (e.g. "Gym 60s", "Archery 30s"). |
| Scrub | Moving the playback position backward through the buffer with a gesture to rewatch a moment. |
| Live mirror | A real-time, mirrored front-camera view with no delay. |
