# CI/CD — GitHub Actions + EAS

AlgoViz+ uses **GitHub Actions** for quality checks and **EAS (Expo Application Services)** for native builds, OTA updates, and store submission.

## Workflows

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| **CI** | `.github/workflows/ci.yml` | Push / PR → `main` | TypeScript, Expo Doctor, web bundle export |
| **EAS Build** | `.github/workflows/eas-build.yml` | Manual, or tag `v*.*.*` | Native Android/iOS builds on EAS |
| **EAS Update** | `.github/workflows/eas-update.yml` | Push → `main` | OTA JavaScript update to `production` channel |
| **EAS Submit** | `.github/workflows/eas-submit.yml` | Manual | Submit latest build to Play Store / App Store |

## One-time setup

### 1. Expo access token

1. Log in: `npx eas login`
2. Create a token: [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens)
3. In GitHub → **Settings → Secrets and variables → Actions**, add:

| Secret | Required for |
|--------|----------------|
| `EXPO_TOKEN` | EAS Build, EAS Update, EAS Submit |

### 2. EAS project env (build-time secrets)

CI uses placeholder env vars. **Real builds** should use [EAS environment variables](https://docs.expo.dev/eas/environment-variables/) so secrets are not stored in the repo.

In the Expo dashboard (or via CLI), set for **production** / **preview**:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

```bash
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://..." --environment production --visibility plaintext
```

Repeat for each variable. Link them to build profiles in `eas.json` if you use multiple environments.

### 3. EAS build profiles

Defined in `eas.json`:

| Profile | Channel | Use case |
|---------|---------|----------|
| `development` | `development` | Dev client, internal |
| `preview` | `preview` | QA / internal APK |
| `production` | `production` | Store + OTA |

## Daily development flow

```
Feature branch → PR → CI runs (typecheck, doctor, web export)
       ↓
   Merge to main → EAS Update publishes OTA to production channel
       ↓
   Tag v1.0.1 → EAS Build (production, all platforms)
       ↓
   Manual EAS Submit → Play Store / App Store
```

## Manual commands (local)

```bash
# Same checks as CI
npm run ci
npm run export:web

# Trigger builds locally (requires EXPO_TOKEN or eas login)
eas build --profile preview --platform android
eas update --channel production --message "Fix login"
eas submit --platform android --latest
```

## Skipping automation

| Commit message contains | Effect |
|-------------------------|--------|
| `[skip ci]` | Skips EAS Update on push to `main` |
| `[skip update]` | Skips EAS Update only |

CI on PRs is **not** skipped by these markers.

## Branch note

This repo uses **`main`**. Older docs referenced `master` / `Shivanshs` from the legacy Kotlin project; workflows target `main`.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `EXPO_TOKEN` missing | Add secret in GitHub repo settings |
| EAS Update fails after merge | Ensure a **production** build exists on the `production` channel first |
| Build fails on env vars | Set variables in EAS dashboard for the build profile |
| `expo-doctor` fails on splash | Use `expo-splash-screen` plugin in `app.json` (SDK 57) |
