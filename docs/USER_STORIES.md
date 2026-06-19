# Hindsight — User Stories

**Version:** 1.0
**Phase:** 1 - User Stories
**Last Updated:** 2026-06-19

---

## 1. Overview

Hindsight is a hands-free "delayed mirror" for reviewing your own physical form during training. The camera films continuously and the screen always shows you from a set number of seconds ago, looping in real time. You perform an exercise, then glance at your propped-up phone and watch your last rep play back without touching anything. It replaces the cumbersome record → stop → open gallery → watch → delete cycle of normal video with an instant, disposable, hands-free loop.

---

## 2. User Persona

**Primary User:** A solo athlete reviewing their own form (e.g. gym lifter, archer).

**Context:**
- Trains alone, with no partner to film or give feedback
- Hands are occupied or chalky; can't be tapping a phone between efforts
- Props the phone on a flexible (gorilla) tripod, a few meters away
- Comfortable with phone apps; wants the tool to disappear into the background

**Current Workaround:**
Films a normal video on the phone, then has to stop it, open the gallery, watch it, and delete it.

**Pain Points:**
- Too many manual steps between performing and reviewing
- Has to physically handle the phone every time, breaking flow
- Accumulates throwaway video files that must be managed and deleted

---

## 3. User Stories

### 3.1 Delayed Mirror (Core)

#### US-1.1: Watch myself on a delay, hands-free
**As an** athlete training alone,
**I want** the phone to continuously show me on a fixed delay,
**So that** I can finish an exercise, look at the screen, and watch my own form without touching the phone.

**Example:** With a 60s delay, I finish a squat set, walk over to the propped phone, and watch the set replay automatically while I catch my breath.

**Priority:** Essential

---

#### US-1.2: Never manage files
**As an** athlete,
**I want** nothing to be recorded or saved,
**So that** I never have to open a gallery or delete clips — it's a live rolling loop only.

**Example:** After a workout I just close the app; there are no videos to clean up.

**Priority:** Essential

---

### 3.2 Delay Control

#### US-2.1: Tune the delay
**As an** athlete,
**I want** to adjust the delay length,
**So that** it matches how long my activity takes before I want to review it.

**Example:** A gym set runs 60–90s so I set ~60s; an archery cycle (position, shoot, watch) is shorter so I set ~30s.

**Priority:** Important

---

#### US-2.2: Delay presets
**As an** athlete,
**I want** preset delay values I can pick quickly,
**So that** I don't re-dial the delay every time I switch activity.

**Example:** I tap a "Gym 60s" or "Archery 30s" preset instead of adjusting manually.

**Priority:** Nice-to-have

---

### 3.3 Playback Gestures

#### US-3.1: Scrub back to rewatch
**As an** athlete,
**I want** to scrub backward with a gesture and rewatch a moment, repeatedly,
**So that** I can study a specific part of my form more than once.

**Example:** I want to see the bottom of my squat again, so I swipe back to it and watch it a few times.

**Priority:** Important

---

#### US-3.2: Single tap to pause
**As an** athlete,
**I want** a single tap to pause the playback,
**So that** I can freeze on a moment and study my position.

**Example:** I tap once to hold the frame at my release point in archery.

**Priority:** Important

---

#### US-3.3: Double tap to return to base delay
**As an** athlete,
**I want** a double tap to snap back to the base delay,
**So that** I can leave rewatch mode and resume the normal delayed loop in one gesture.

**Example:** After rewatching a rep a few times, I double-tap and the screen is back to showing me 60s behind live.

**Priority:** Important

---

### 3.4 Live Mirror

#### US-4.1: Live mirrored view
**As an** athlete,
**I want** a front-camera mode that shows me live with no delay, mirrored,
**So that** I can watch myself in real time like a mirror.

**Example:** I switch to the front camera and see a live, mirrored view of myself while moving.

**Priority:** Nice-to-have

---

### 3.5 Experience (Cross-cutting)

#### US-5.1: Minimal, distraction-free, gesture-driven UI
**As an** athlete mid-workout,
**I want** a clean, minimal interface controlled mostly by gestures,
**So that** the tool stays out of my way and is readable from a few meters in a gym.

**Example:** The screen is mostly just my video; controls are gestures rather than visible buttons cluttering the view.

**Priority:** Essential

---

## 4. Scope

### In Scope (v1)
- Continuous delayed-mirror loop (rear camera, un-mirrored)
- Tunable delay, with presets
- Scrub back to rewatch, single-tap pause, double-tap return to base delay
- Live mirrored front-camera view (no delay)
- Ephemeral rolling buffer (nothing saved)
- Minimal, gesture-driven, distraction-free UI

### Out of Scope (Future)
- None specified yet — captured as ideas surface, not invented here.

### Explicitly Not This App
- Recording, saving, or exporting video files
- Any photo-gallery or file-management experience

---

## 5. Open Items

- [ ] How far back scrubbing reaches — behaviorally it's "recent reps," exact window pinned in Phase 2/3 (a technical detail, not a user need).
- [ ] How the user switches between the delayed rear view and the live front mirror (gesture vs control) — interaction design.
- [ ] Screen orientation in use (portrait vs landscape on the tripod) — to confirm.
