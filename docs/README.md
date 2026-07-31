# AlgoViz+ Documentation Index

Project documentation for **AlgoViz+** (`Harry0786/ALGOVIZ`), an Android learning app for algorithms with collaborative study rooms, Supabase backend, and in-app OTA updates.

| Document | Description |
|----------|-------------|
| [01_PRD.md](./01_PRD.md) | Product Requirements Document |
| [02_TLD.md](./02_TLD.md) | Technical Level Design |
| [03_UML.md](./03_UML.md) | UML diagrams (use case, class, sequence, activity, component) |
| [04_ERD.md](./04_ERD.md) | Entity Relationship Diagram and data dictionary |
| [05_SYSTEM_ARCHITECTURE.md](./05_SYSTEM_ARCHITECTURE.md) | System architecture (modules, layers, deployment) |
| [06_SYSTEM_DESIGN.md](./06_SYSTEM_DESIGN.md) | System design (flows, patterns, non-functionals) |
| [07_API_BACKEND_AUTH_STORAGE.md](./07_API_BACKEND_AUTH_STORAGE.md) | API, backend logic, DB, storage, auth, permissions |
| [08_PROJECT_MANAGEMENT.md](./08_PROJECT_MANAGEMENT.md) | Project management (roles, roadmap, risks, CI/CD) |
| [08_SUPABASE_SETUP.md](./08_SUPABASE_SETUP.md) | Supabase schema, RLS, storage, OAuth (React Native) |
| [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) | Fix Google Sign-In 400 errors (iOS/Android client IDs) |
| [CI_CD.md](./CI_CD.md) | GitHub Actions + EAS build/update/submit pipelines |
| [STORE_DEPLOYMENT.md](./STORE_DEPLOYMENT.md) | Play Store & App Store submission checklist |
| [code/INDEX.md](./code/INDEX.md) | Implementation code reference for Expo Router app |

## Quick facts

| Item | Value |
|------|--------|
| Package (release) | `com.algoviz.plus` |
| Package (debug) | `com.algoviz.plus.debug` |
| Backend | Supabase (`zosawqjebxkjppwtkegx`) |
| Architecture | Clean Architecture + MVVM + Hilt |
| UI | Jetpack Compose + Material 3 |
| Version (as of docs) | `2.0.13` / `versionCode` 18 |

## Related repo assets

- `AUTH_SETUP.md` — Google / Supabase auth setup
- `SUPABASE_DEPLOYMENT_GUIDE.md` — SQL deployment
- `scripts/supabase_full_recovery.sql` — full schema + RLS
- `scripts/setup_user_profiles.sql` — profiles only
- `.github/workflows/ci.yml` — CI (typecheck, expo-doctor, web export)
- `.github/workflows/eas-build.yml` — EAS native builds
- `.github/workflows/eas-update.yml` — OTA updates on merge to main
- `.github/workflows/eas-submit.yml` — Store submission (manual)
- `docs/CI_CD.md` — Setup secrets and workflow guide
