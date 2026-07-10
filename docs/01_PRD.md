# Product Requirements Document (PRD)

**Product:** AlgoViz+  
**Repository:** `Harry0786/ALGOVIZ`  
**Platform:** Android (minSdk 26, targetSdk 34)  
**Document status:** Living document aligned to current codebase  
**Last updated:** 2026-07-04

---

## 1. Product overview

### 1.1 Vision

AlgoViz+ helps students and developers **learn algorithms visually** and **collaborate in real-time study rooms**, with accounts, profiles, and seamless in-app updates.

### 1.2 Problem

- Algorithm concepts are hard to internalize from text alone.
- Learners lack a lightweight place to discuss problems while studying.
- Distributing Android updates outside Play Store is painful without OTA.

### 1.3 Solution

A native Android app that provides:

1. Interactive algorithm visualizations (local catalog, step playback).
2. Collaborative study rooms with chat, presence, and typing indicators.
3. Supabase-backed auth (email + Google) and profiles.
4. GitHub Release–driven in-app APK updates (with Supabase fallback).

---

## 2. Goals and non-goals

### 2.1 Goals

| ID | Goal | Success metric |
|----|------|----------------|
| G1 | Users can sign in with email or Google | Login success rate, no DEVELOPER_ERROR on release |
| G2 | Users complete profile onboarding | Name + username saved to `user_profiles` |
| G3 | Users browse and play algorithm visualizations | Steps play/pause/speed work offline |
| G4 | Users create/join study rooms and chat | Messages appear in realtime for members |
| G5 | Users receive optional/forced app updates | Update dialog from GitHub/Supabase metadata |
| G6 | Secure multi-user data access | RLS policies enforce own-row and room access |

### 2.2 Non-goals (current product)

- iOS / web clients (Android-only today).
- Server-side algorithm execution.
- Full LMS (courses, grades, payments).
- Play Store–only distribution (sideload + OTA supported).

---

## 3. Personas

| Persona | Needs |
|---------|--------|
| **Student** | Visualize sorting/graphs, join study rooms, chat with peers |
| **Self-learner** | Offline-capable algorithm catalog, profile identity |
| **Maintainer** | Publish signed APK via GitHub Actions, update `app_config` |

---

## 4. Features and requirements

### 4.1 Authentication

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-01 | Email/password registration | Must |
| AUTH-02 | Email verification (when enabled by Supabase) | Must |
| AUTH-03 | Email/password login | Must |
| AUTH-04 | Google Sign-In via ID token → Supabase | Must |
| AUTH-05 | Password reset via email deep link (`algovizplus://password-reset`) | Must |
| AUTH-06 | Session restore on app launch | Must |
| AUTH-07 | Logout clears session and redirects to login | Must |
| AUTH-08 | Change password for logged-in email users | Should |

### 4.2 Profile

| ID | Requirement | Priority |
|----|-------------|----------|
| PROF-01 | Profile fields: name, username, email, phone, avatar, color index | Must |
| PROF-02 | Force profile edit when name/username incomplete | Must |
| PROF-03 | Persist profile locally (DataStore) and remotely (`user_profiles`) | Must |
| PROF-04 | Upload avatar to Storage bucket `Algoviz` | Must |
| PROF-05 | Hydrate profile from remote after auth (with retries) | Must |
| PROF-06 | Fallback to auth metadata if table missing | Should |

### 4.3 Algorithms & learning

| ID | Requirement | Priority |
|----|-------------|----------|
| ALGO-01 | Catalog of algorithms (sorting, search, graph, DP, etc.) | Must |
| ALGO-02 | Visualization screen with step playback | Must |
| ALGO-03 | Playback controls (play, pause, speed) | Must |
| ALGO-04 | Learn screen / playlists (local preferences) | Should |
| ALGO-05 | Works offline (local generators, no network required) | Must |

### 4.4 Study rooms

| ID | Requirement | Priority |
|----|-------------|----------|
| ROOM-01 | List active study rooms | Must |
| ROOM-02 | Create room (name, description, category, privacy, max members) | Must |
| ROOM-03 | Join / leave room | Must |
| ROOM-04 | Realtime chat messages | Must |
| ROOM-05 | Member list with online status | Must |
| ROOM-06 | Typing indicators | Should |
| ROOM-07 | Unread counts | Should |
| ROOM-08 | Global presence heartbeat while app is started | Must |
| ROOM-09 | In-app notifications for room activity | Should |
| ROOM-10 | Delete room (creator/admin flows as implemented) | Should |

### 4.5 App updates

| ID | Requirement | Priority |
|----|-------------|----------|
| UPD-01 | Check GitHub latest release for `algoviz-update.json` | Must |
| UPD-02 | Fallback to Supabase `app_config` (`latest_version`) | Must |
| UPD-03 | Download APK via DownloadManager | Must |
| UPD-04 | Install via FileProvider + package installer | Must |
| UPD-05 | Support force update flag | Must |
| UPD-06 | Admin UI to publish config (internal, not in main nav) | Could |

### 4.6 Platform / ops

| ID | Requirement | Priority |
|----|-------------|----------|
| OPS-01 | CI build + unit tests on push/PR | Must |
| OPS-02 | Release workflow on `master` push | Must |
| OPS-03 | Signed release APK + GitHub Release assets | Must |
| OPS-04 | Secrets never committed (`local.properties`, keystore) | Must |

---

## 5. User journeys

### 5.1 First-time Google user

1. Open app → splash → login.
2. Tap Google Sign-In → select account.
3. Supabase session created; profile row auto-created (trigger) or hydrated from metadata.
4. If name/username incomplete → profile edit onboarding.
5. Land on Home.

### 5.2 Study session

1. Open Study Rooms → create or join room.
2. Chat with members; presence shows online.
3. Navigate to Algorithms → open visualization → practice steps.
4. Return to chat; unread/notifications as applicable.

### 5.3 Update

1. App launches → checks GitHub then Supabase for newer `versionCode`.
2. Dialog shows notes; user updates (or forced).
3. APK downloads and install prompt appears.

---

## 6. Functional scope by screen

| Screen | Route | Primary actions |
|--------|-------|-----------------|
| Login | `login` | Email login, Google, navigate register/reset |
| Register | `register` | Sign up, verify email |
| Reset password | `reset_password` | Request / set new password |
| Home | `main` | Navigate features |
| Algorithms | `algorithms` | Browse catalog |
| Visualization | `visualization/{id}` | Play steps |
| Learn | `learn` | Learning content / playlists |
| Study rooms | `study_rooms` | List/join |
| Create room | `create_room` | Create |
| Chat | `chat/{roomId}` | Message, members |
| Profile | `profile` | View |
| Profile edit | `profile/edit` | Edit, avatar upload |

---

## 7. Non-functional requirements

| Area | Requirement |
|------|-------------|
| Performance | Splash ≤ ~1.2s frames; presence heartbeat ~25s |
| Offline | Algorithm catalog and visualization work offline |
| Security | RLS on all public tables; publishable key only in client |
| Privacy | Users read own profile; room members can read co-member profiles |
| Reliability | Profile hydrate retries; update check fails open (no block) |
| Compatibility | Android 8.0+ (API 26+) |

---

## 8. Constraints and assumptions

- Backend is **Supabase** (Auth, PostgREST, Realtime, Storage).
- Google Sign-In requires correct **Web client ID** + **Android OAuth client** (package + SHA-1).
- Release APKs are signed with CI keystore secrets.
- Algorithms are **client-side** (no remote algorithm API).
- Room IDs and message IDs are client-generated text/UUIDs as implemented.

---

## 9. Out of scope / future

- Cross-platform (KMP / Flutter / iOS).
- Push notifications (FCM not wired in app module).
- Voice/video in study rooms.
- Algorithm progress analytics dashboard.
- Multi-tenant organizations.

---

## 10. Acceptance criteria (release-ready)

- [ ] Email and Google sign-in work on release package `com.algoviz.plus`.
- [ ] `user_profiles` and study-room tables exist with RLS.
- [ ] Profile save and avatar upload succeed for authenticated users.
- [ ] Study room create/join/chat works with realtime updates.
- [ ] Algorithm visualization plays steps offline.
- [ ] OTA update path works from GitHub Release metadata.
- [ ] CI green on `Shivanshs`; release workflow succeeds on `master`.
