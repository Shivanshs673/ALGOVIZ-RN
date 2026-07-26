# Google Sign-In Setup (Expo + Supabase)

**Error `400: invalid_request`** means Google rejected the OAuth request — almost always a **client ID / redirect URI / platform mismatch**.

---

## Why you saw "Access blocked: invalid request"

| Cause | Fix |
|-------|-----|
| **Wrong Android redirect URI** (most common on Android) | Google requires `com.googleusercontent.apps.{android-client-hash}:/oauthredirect` — not `com.algoviz.plus` or `algovizplus://` |
| **Missing iOS Client ID** (testing on iOS Simulator) | Create iOS OAuth client + add `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` |
| **Android SHA-1 / package mismatch** | Add debug SHA-1 for `com.algoviz.plus` in Google Cloud |
| **Using Expo Go** | OAuth needs a **development build** (`npx expo run:ios` / `run:android`) |
| **Client IDs not in Supabase** | Add Web + iOS + Android IDs in Supabase → Auth → Google |
| **OAuth consent screen in Testing** | Add your Gmail as a test user in Google Cloud |

---

## Step 1 — Google Cloud Console

Project: [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)

### A) Web client (required for Supabase + token exchange)

1. **Create OAuth client ID** → **Web application**
2. **Authorized redirect URIs** — add your Supabase callback:
   ```
   https://agmehbmxbcsjoosqhdzf.supabase.co/auth/v1/callback
   ```
   (Copy exact URL from Supabase Dashboard → Authentication → Providers → Google)

3. Copy **Client ID** → `.env` as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

### B) iOS client (required for iPhone / iOS Simulator)

1. **Create OAuth client ID** → **iOS**
2. **Bundle ID:** `com.algoviz.plus`
3. Copy **Client ID** → `.env` as `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
4. Note the **reversed client ID** for URL scheme, e.g.:
   ```
   com.googleusercontent.apps.128575200416-xxxxxxxxxx
   ```
5. Add that scheme to `app.json` under `ios.infoPlist.CFBundleURLTypes` (second entry), then rebuild:
   ```bash
   npx expo prebuild --clean
   npx expo run:ios
   ```

### C) Android client (required for Android emulator / device)

1. **Create OAuth client ID** → **Android**
2. **Package name:** `com.algoviz.plus`
3. **SHA-1 certificate fingerprint** (debug keystore):
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep SHA1
   ```
4. Copy **Client ID** → `.env` as `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
5. **Redirect URI** (automatic in this project via `app.config.ts` + `useAuth.ts`):
   ```
   com.googleusercontent.apps.128575200416-xxxxxxxx:/oauthredirect
   ```
   Replace `xxxxxxxx` with the hash from your Android client ID (the part before `.apps.googleusercontent.com`).

6. Run with dev build (not Expo Go) — **required after any scheme change**:
   ```bash
   npx expo prebuild --clean
   npx expo run:android
   ```

---

## Step 2 — Supabase Dashboard

1. **Authentication → Providers → Google** → Enable
2. Paste **Web Client ID** and **Client Secret** (from Web client)
3. In **Client IDs (comma-separated)**, add **all three**:
   ```
   WEB_CLIENT_ID,ANDROID_CLIENT_ID,IOS_CLIENT_ID
   ```
4. For iOS during development, enable **Skip nonce check** (optional but helps)

---

## Step 3 — `.env` file

```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=xxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxxx.apps.googleusercontent.com
```

Restart Metro after changing `.env`:
```bash
npx expo start -c
```

---

## Step 4 — Rebuild native app

Google Sign-In **does not work in Expo Go**. Use a development build:

```bash
npx expo prebuild --clean
npx expo run:ios      # or run:android
```

---

## Quick checklist

- [ ] Web, iOS, and Android OAuth clients created
- [ ] Supabase Google callback URL in Web client redirect URIs
- [ ] All 3 client IDs in Supabase Google provider
- [ ] `.env` has all 3 `EXPO_PUBLIC_GOOGLE_*` variables
- [ ] iOS reversed URL scheme in `app.json` (after creating iOS client)
- [ ] Android debug SHA-1 added for `com.algoviz.plus`
- [ ] Running **dev build**, not Expo Go
- [ ] Test user added if OAuth consent is in "Testing" mode