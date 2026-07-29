# CI/CD — GitHub Actions + EAS

AlgoViz+ uses **GitHub Actions** for quality checks and **EAS (Expo Application Services)** for native builds, OTA updates, and store submission.

## Workflows

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| **CI** | `.github/workflows/ci.yml` | Push / PR → `main` | TypeScript, Expo Doctor, web bundle export |
| **EAS Build** | `.github/workflows/eas-build.yml` | Manual, or tag `v*.*.*` | Native Android/iOS builds (split jobs) |
| **EAS Update** | `.github/workflows/eas-update.yml` | Push → `main`, manual | OTA update to `preview` channel (default) |
| **EAS Submit** | `.github/workflows/eas-submit.yml` | Manual | Submit latest build to Play Store / App Store |

---

## One-time setup

### 1. GitHub secret — `EXPO_TOKEN`

1. Log in: `npx eas login`
2. Create token: [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens)
3. GitHub → **Settings → Secrets → Actions** → add secret named **`EXPO_TOKEN`**

### 2. EAS environment variables (required for builds)

Add these in [expo.dev](https://expo.dev) → your project → **Environment variables** for **both** `preview` and `production`:

| Variable | Source |
|----------|--------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase dashboard |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google Cloud |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Google Cloud |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google Cloud |

> **Important:** Preview builds fail silently without env vars if you only added them to `production`. Copy all five to the **`preview`** environment too.

CLI example:

```bash
eas env:create --name EXPO_PUBLIC_SUPABASE_URL \
  --value "https://YOUR_PROJECT.supabase.co" \
  --environment preview \
  --visibility plaintext
```

Repeat for each variable and for `production`.

### 3. iOS builds (only if you need iOS)

iOS **cannot** build in CI until Apple credentials exist on Expo. Run **once locally**:

```bash
eas build --profile preview --platform ios
```

Follow prompts to create Distribution Certificate + Provisioning Profile. After that, GitHub Actions iOS builds will work.

Until then, use **platform: android** only (default).

---

## Build profiles

| Profile | Channel | Platform | Use case |
|---------|---------|----------|----------|
| `development` | `development` | Android/iOS | Dev client (`expo-dev-client`) |
| `preview` | `preview` | Android/iOS | Internal QA APK |
| `production` | `production` | Android/iOS | Store release |

---

## How each workflow behaves

### CI — no secrets needed

Runs on every PR and push to `main`. Checks TypeScript, Expo Doctor, and web bundle export.

### EAS Build — split Android / iOS jobs

| Trigger | What runs |
|---------|-----------|
| Manual, platform **android** | Android only ✅ |
| Manual, platform **ios** | iOS only (needs Apple credentials) |
| Manual, platform **all** | Android + iOS as **separate jobs** (iOS may fail until creds set up) |
| Tag `v1.0.0` | **Android production only** (safe default) |

**Why only Android/preview worked before:** iOS requires Apple Developer credentials that must be created interactively once. Selecting "all" failed because iOS failed the whole job.

### EAS Update — OTA JavaScript updates

| Trigger | Channel | Notes |
|---------|---------|-------|
| Push to `main` | `preview` | Matches your preview APK builds |
| Manual dispatch | choose channel | Use `production` after you have production builds |

**Requirements:**
1. `expo-updates` installed ✅ (in `package.json`)
2. At least one EAS build on the **same channel** (e.g. preview build → preview OTA)
3. Channel in update must match channel in build profile

Switch default OTA channel to `production` in `.github/workflows/eas-update.yml` once you have production builds installed on devices.

Skip OTA on a commit:

```
git commit -m "docs only [skip update]"
```

---

## Typical flow

```
1. PR → CI passes
2. Manual EAS Build → preview / android  (first time)
3. Merge to main → EAS Update publishes to preview channel
4. Devices with preview APK receive OTA update
5. When ready for store: production build → switch OTA to production channel
6. Tag v1.0.0 → Android production build
7. Manual EAS Submit → Play Store
```

---

## Local commands

```bash
npm run ci                    # same as CI quality job
npm run export:web            # same as CI bundle job
eas build --profile preview --platform android
eas update --channel preview --message "Fix login"
eas submit --platform android --latest
```

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `expo-updates package hasn't been installed` | Missing dependency | Fixed — `expo-updates` in package.json |
| `Unexpected token '{'` reading app.config | TypeScript config not parsed in CI | Fixed — use `app.config.js` |
| iOS credentials not set up | No Apple certs on Expo | Run `eas build -p ios` locally once |
| Preview build missing env vars | Vars only in production env | Add vars to **preview** environment on EAS |
| OTA update fails | No build on matching channel | Build preview APK first, then merge to main |
| `splash.png` not found | Wrong splash path | Fixed — uses `splash-icon.png` |
| `react-native-web` missing | Web export in CI | Fixed — in package.json |
| Node engine warnings | Supabase needs Node 22+ | Fixed — `.nvmrc` set to 22 |

---

## Files reference

```
.github/workflows/ci.yml         — quality checks
.github/workflows/eas-build.yml  — native builds (android + ios jobs)
.github/workflows/eas-update.yml — OTA updates
.github/workflows/eas-submit.yml — store submission
app.config.js                    — dynamic Google OAuth URL schemes
eas.json                         — build profiles + channels
.nvmrc                           — Node 22
```
