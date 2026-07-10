# Technical Level Design (TLD)

**Product:** AlgoViz+  
**Audience:** Engineers implementing or extending the system  
**Last updated:** 2026-07-04

---

## 1. Purpose

This document defines **how** AlgoViz+ is built: modules, layers, key components, data ownership, and integration contracts. It complements the PRD (what) and System Design (why/how flows).

---

## 2. Technology stack

| Layer | Technology |
|-------|------------|
| Language | Kotlin |
| UI | Jetpack Compose, Material 3 |
| Architecture | Clean Architecture + MVVM |
| DI | Hilt |
| Async | Coroutines, Flow, StateFlow |
| Local prefs | DataStore Preferences |
| Local DB | Room (placeholder; primary data is remote) |
| Backend | Supabase Kotlin SDK 3.x (Auth, Postgrest, Realtime, Storage) |
| Auth UI | Google Play Services Auth |
| Networking (legacy) | Retrofit/OkHttp (`api.algoviz.app` — not primary) |
| Build | AGP 8.7.x, Gradle 8.14.x, JDK 17 |
| CI/CD | GitHub Actions |

---

## 3. Module map

```
AlgoVizPlus
├── app                    # Shell, navigation, feature screens, updates
├── features
│   └── auth               # Auth feature (domain/data/presentation)
├── features               # Aggregator placeholder
├── domain                 # Models, repository interfaces, use cases
├── data                   # Algorithm catalog, study-room repositories
└── core
    ├── common             # Result, errors, dispatchers, identity utils
    ├── ui                 # BaseViewModel, shared UI
    ├── designsystem       # Theme tokens
    ├── network            # SupabaseClient, NetworkModule
    ├── database           # Room (minimal)
    └── datastore          # PreferencesManager
```

### Dependency rules

```
app → features:auth, data, domain, core:*
features:auth → domain (auth contracts), core:*
data → domain, core:*
domain → (no Android framework deps)
core:* → minimal / no feature deps
```

---

## 4. Layer responsibilities

| Layer | Responsibility | Examples |
|-------|----------------|----------|
| **Presentation** | Compose UI, ViewModels, UI state | `AuthViewModel`, `ProfileViewModel`, `ChatRoomViewModel` |
| **Domain** | Business rules, use cases, models | `LoginUseCase`, `SendMessageUseCase`, `StudyRoom` |
| **Data** | Repositories, remote/local sources | `SupabaseStudyRoomDataSource`, `AlgorithmProvider` |
| **Core** | Shared infra | `SupabaseModule`, `PreferencesManager` |

---

## 5. Key components

### 5.1 Application shell

| Component | Path | Role |
|-----------|------|------|
| `AlgoVizApplication` | `app/.../AlgoVizApplication.kt` | Hilt entry |
| `MainActivity` | `app/.../MainActivity.kt` | Compose host, deeplinks, presence heartbeat |
| `RootNavHost` | `app/.../navigation/RootNavHost.kt` | Auth gate, splash, routes |

### 5.2 Auth

| Component | Role |
|-----------|------|
| `SupabaseAuthDataSource` | Supabase Auth API calls |
| `AuthRepositoryImpl` | Repository implementation |
| `AuthViewModel` | UI state, pending-op guard |
| `GoogleSignInHelper` | Play Services sign-in + error mapping |

### 5.3 Profile

| Component | Role |
|-----------|------|
| `ProfileRemoteDataSource` | `user_profiles` CRUD + Storage upload |
| `ProfileViewModel` | Local + remote hydrate/save |
| `PreferencesManager` | DataStore cache |

### 5.4 Study rooms

| Component | Role |
|-----------|------|
| `SupabaseStudyRoomDataSource` | PostgREST + Realtime |
| `StudyRoomRepositoryImpl` | Domain repository |
| Use cases | Create/join/leave/message/presence |
| `StudyRoomsViewModel` / `ChatRoomViewModel` | UI |

### 5.5 Algorithms

| Component | Role |
|-----------|------|
| `AlgorithmProvider` | Static catalog (~37 algorithms) |
| Step generators | Sorting, graph, DP, etc. |
| `GenerateAlgorithmStepsUseCase` | Produce visualization steps |

### 5.6 Updates

| Component | Role |
|-----------|------|
| `AppUpdateViewModel` | Check GitHub → Supabase, download, install |
| `AppUpdateDialog` | UI + download broadcast |
| `AdminAppUpdateViewModel` | Upsert `app_config` (internal) |

---

## 6. Configuration model

### BuildConfig fields

| Field | Source | Used by |
|-------|--------|---------|
| `SUPABASE_URL` | `local.properties` / secrets (per variant) | Supabase client |
| `SUPABASE_KEY` | publishable/anon key | Supabase client |
| `GOOGLE_WEB_CLIENT_ID` | Web OAuth client | Google Sign-In `requestIdToken` |
| `VERSION_CODE` / `VERSION_NAME` | `app/build.gradle.kts` | Update checks |

### Variants

| Variant | Application ID | Minify |
|---------|----------------|--------|
| debug | `com.algoviz.plus.debug` | No |
| staging | `com.algoviz.plus.staging` | Yes |
| release | `com.algoviz.plus` | Yes |

---

## 7. Data ownership

| Data | Owner | Store |
|------|-------|-------|
| Auth session | Supabase Auth | Secure session storage (SDK) |
| Profile | User | `user_profiles` + DataStore cache |
| Avatars | User | Storage `Algoviz/profile_images/{uid}.jpg` |
| Study rooms | Creator + members | PostgREST tables |
| Messages | Sender | `study_room_messages` |
| Presence | User | `user_presence` |
| Algorithm catalog | App | In-memory / code |
| Update metadata | Maintainers | GitHub Release + `app_config` |

---

## 8. Integration contracts

### 8.1 Supabase

- URL: project REST/Auth/Realtime/Storage endpoints.
- Client plugins: Auth, Postgrest, Realtime, Storage.
- Deep link scheme: `algovizplus`, host: `password-reset`.

### 8.2 Google

- Android app uses **Web client ID** only for ID token.
- Android OAuth clients (package + SHA-1) must exist in Google Cloud for each package/signing key.

### 8.3 GitHub Releases

- `GET /repos/Harry0786/ALGOVIZ/releases/latest`
- Asset `algoviz-update.json`:

```json
{
  "version_code": 19,
  "version_name": "2.0.14",
  "apk_url": "https://github.com/.../algoviz-v2.0.14-19.apk",
  "release_notes": "...",
  "force_update": false
}
```

---

## 9. Error handling strategy

| Area | Strategy |
|------|----------|
| Auth | Map Supabase/Google errors to user-facing strings |
| Profile | Local-first save; remote failure shows non-blocking message |
| Study rooms | Flow errors logged; UI shows empty/error states |
| Updates | Fail silent on check; explicit failure on download/install |
| Missing `user_profiles` | Metadata fallback (client resilience) |

---

## 10. Security design notes

- Client holds **publishable/anon** key only.
- **Service role** key only in CI/scripts (`SUPABASE_SERVICE_ROLE_KEY`).
- RLS enabled on all public tables.
- Avatar paths constrained to `profile_images/{auth.uid()}.jpg`.
- Release signing secrets in GitHub Actions only.

---

## 11. Extension points

| Extension | Approach |
|-----------|----------|
| New algorithm | Add to `AlgorithmProvider` + step generator |
| New room category | Extend `RoomCategory` + UI filters |
| Push notifications | Wire FCM (not active today) |
| Cross-platform | Extract `domain`/`data` to KMP |

---

## 12. Related documents

- [PRD](./01_PRD.md)
- [UML](./03_UML.md)
- [ERD](./04_ERD.md)
- [System Architecture](./05_SYSTEM_ARCHITECTURE.md)
- [System Design](./06_SYSTEM_DESIGN.md)
- [API & Backend](./07_API_BACKEND_AUTH_STORAGE.md)
