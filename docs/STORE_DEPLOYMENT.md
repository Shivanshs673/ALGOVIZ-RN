# Store Deployment Checklist — AlgoViz+

Use this before submitting to **Google Play** and **Apple App Store**.

## Pre-build (must do once)

### 1. EAS environment variables
Set all 5 `EXPO_PUBLIC_*` vars on **production** (and preview for testing):
- Supabase URL + anon key
- Google Web, Android, iOS client IDs

### 2. Google OAuth for production APK/AAB
Add **EAS keystore SHA-1** to Google Cloud Android OAuth client:
```bash
eas credentials -p android
```
Package: `com.algoviz.plus`

### 3. Supabase backend
Run SQL from:
- `scripts/supabase_full_recovery.sql` (or `docs/08_SUPABASE_SETUP.md`)
- `scripts/delete_account.sql` (account deletion — **required for App Store**)

Enable Google provider in Supabase Auth with all 3 client IDs.

Add redirect URL in Supabase Auth settings:
```
algovizplus://password-reset
```

### 4. Legal URLs
Update `src/constants/legal.ts` with your real:
- Privacy Policy URL
- Terms of Service URL
- Support email

Host privacy policy pages before store submission (Apple/Google require working URLs).

---

## Build commands

```bash
# Production Android (AAB for Play Store)
eas build --profile production --platform android

# Production iOS (requires Apple credentials set up once locally)
eas build --profile production --platform ios

# Or via GitHub Actions → EAS Build
```

After first production build, switch OTA channel in `.github/workflows/eas-update.yml` from `preview` to `production` if desired.

---

## Store listing requirements

| Item | Status in app |
|------|----------------|
| Privacy Policy link | Profile → Legal |
| Terms of Service link | Profile → Legal |
| Account deletion | Profile → Delete Account |
| Support contact | Profile → Contact Support |
| Encryption declaration | `ITSAppUsesNonExemptEncryption: false` |
| Photo permission string | expo-image-picker plugin |

### Google Play
- Upload **AAB** (production profile uses `app-bundle`)
- Complete Data safety form (email, profile, chat messages, photos)
- Content rating questionnaire
- Target API level meets Play requirements (Expo SDK 57 handles this)

### Apple App Store
- Run `eas build --profile production --platform ios` locally once for credentials
- App Privacy details in App Store Connect
- Export compliance: app uses standard HTTPS only (`ITSAppUsesNonExemptEncryption: false`)
- Account deletion in-app (Profile screen)

---

## Feature verification checklist

Test on a **fresh production/preview build** (not Expo Go):

- [ ] Email sign up + sign in
- [ ] Google sign in (after EAS SHA-1 added)
- [ ] Forgot password → email link → set new password
- [ ] Profile edit (name, username, phone)
- [ ] Avatar upload
- [ ] Algorithm visualization (pick 3–4 algorithms)
- [ ] Learn concepts open
- [ ] Progress tracking updates
- [ ] Study room create / join / chat
- [ ] Sign out
- [ ] Delete account (with `delete_account.sql` deployed)

---

## Common production issues

| Issue | Fix |
|-------|-----|
| Login fails on installed APK | Rebuild after EAS env vars added; add EAS SHA-1 to Google Cloud |
| Demo rooms banner showing | Supabase not configured in build — check production env vars |
| Google button disabled | Missing Google client IDs in EAS production env |
| Account delete partial | Run `scripts/delete_account.sql` in Supabase |
| OTA not applying | Build and install production channel build first |

---

## Submit

```bash
eas submit --platform android --latest
eas submit --platform ios --latest
```

Or GitHub Actions → **EAS Submit**.
