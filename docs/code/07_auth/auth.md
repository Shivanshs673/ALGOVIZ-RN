# Auth Feature + Supabase Client
**Files:**
- `src/lib/supabase/client.ts`
- `src/features/auth/store/authStore.ts`
- `src/features/auth/hooks/useAuth.ts`
- `app/(auth)/login.tsx`
- `app/(auth)/register.tsx`
- `app/(auth)/forgot-password.tsx`
- `app/index.tsx` ← Auth gate

---

## client.ts

```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// SecureStore adapter for Supabase session persistence
const ExpoSecureStoreAdapter = {
  getItem:    (key: string) => SecureStore.getItemAsync(key),
  setItem:    (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,  // React Native — no URL detection
    },
  }
);
```

---

## authStore.ts

```typescript
// src/features/auth/store/authStore.ts
import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase/client';

interface AuthStore {
  session: Session | null;
  user: User | null;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  user: null,
  initialized: false,

  setSession: (session) => set({
    session,
    user: session?.user ?? null,
    initialized: true,
  }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));

// Listen to auth state changes globally (call once at app start)
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
});
```

---

## useAuth.ts

```typescript
// src/features/auth/hooks/useAuth.ts
import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import { supabase } from '../../../lib/supabase/client';

WebBrowser.maybeCompleteAuthSession();

export function useEmailAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithEmail(email: string, password: string): Promise<void> {
    setLoading(true); setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // authStore.setSession() called automatically via onAuthStateChange
    } catch (e: any) {
      setError(e.message ?? 'Sign in failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function signUpWithEmail(email: string, password: string, name: string): Promise<void> {
    setLoading(true); setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name } },
      });
      if (error) throw error;
    } catch (e: any) {
      setError(e.message ?? 'Sign up failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(email: string): Promise<void> {
    setLoading(true); setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (e: any) {
      setError(e.message ?? 'Reset failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { signInWithEmail, signUpWithEmail, resetPassword, loading, error, clearError: () => setError(null) };
}

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      setLoading(true);
      supabase.auth
        .signInWithIdToken({ provider: 'google', token: id_token })
        .then(({ error }) => { if (error) setError(error.message); })
        .finally(() => setLoading(false));
    } else if (response?.type === 'error') {
      setError('Google sign in failed');
    }
  }, [response]);

  return {
    signInWithGoogle: () => promptAsync(),
    loading,
    error,
    disabled: !request,
  };
}
```

---

## Login Screen — app/(auth)/login.tsx

```tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { useEmailAuth, useGoogleAuth } from '../../src/features/auth/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { signInWithEmail, loading, error, clearError } = useEmailAuth();
  const { signInWithGoogle, loading: googleLoading, disabled: googleDisabled } = useGoogleAuth();

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter email and password');
      return;
    }
    try {
      await signInWithEmail(email.trim(), password);
      // Navigation handled by auth gate in root layout
    } catch { /* error shown in UI */ }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Logo / branding */}
          <View style={styles.hero}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>AV+</Text>
            </View>
            <Text style={styles.heroTitle}>AlgoViz+</Text>
            <Text style={styles.heroSubtitle}>Learn algorithms visually</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={clearError}><Ionicons name="close" size={18} color="#FF4757" /></TouchableOpacity>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="#6B6B8A" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput style={[styles.input, styles.passwordInput]} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor="#6B6B8A" secureTextEntry={!showPassword} autoCapitalize="none" />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#9E9EB8" />
                </TouchableOpacity>
              </View>
            </View>

            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </Link>

            {/* Sign in button */}
            <TouchableOpacity style={[styles.primaryBtn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
              <Text style={styles.primaryBtnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google button */}
            <TouchableOpacity
              style={[styles.googleBtn, (googleLoading || googleDisabled) && styles.btnDisabled]}
              onPress={signInWithGoogle}
              disabled={googleLoading || googleDisabled}
            >
              <Text style={styles.googleBtnText}>🔵 Continue with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Sign up link */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity><Text style={styles.signupLink}>Sign Up</Text></TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 24, gap: 24, minHeight: '100%', justifyContent: 'center' },
  hero: { alignItems: 'center', gap: 8 },
  logoBox: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#6C63FF', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  heroTitle: { color: '#FFFFFF', fontSize: 32, fontWeight: '900' },
  heroSubtitle: { color: '#9E9EB8', fontSize: 15 },
  form: { gap: 14 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FF475722', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#FF4757' },
  errorText: { color: '#FF4757', flex: 1, fontSize: 13 },
  field: { gap: 6 },
  label: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  input: { backgroundColor: '#1E1E2E', color: '#FFFFFF', borderRadius: 14, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#2A2A4A' },
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeBtn: { position: 'absolute', right: 14, top: 14 },
  forgotBtn: { alignSelf: 'flex-end' },
  forgotText: { color: '#6C63FF', fontSize: 13 },
  primaryBtn: { backgroundColor: '#6C63FF', borderRadius: 14, padding: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#2A2A4A' },
  dividerText: { color: '#6B6B8A', fontSize: 13 },
  googleBtn: { backgroundColor: '#1E1E2E', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2A2A4A' },
  googleBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupText: { color: '#9E9EB8', fontSize: 14 },
  signupLink: { color: '#6C63FF', fontSize: 14, fontWeight: '700' },
});
```

---

## Register Screen — app/(auth)/register.tsx

```tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { useEmailAuth } from '../../src/features/auth/hooks/useAuth';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const { signUpWithEmail, loading, error } = useEmailAuth();

  function validatePassword(p: string): string | null {
    if (p.length < 8) return 'Password must be at least 8 characters';
    return null;
  }

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Missing fields', 'Please fill in all fields'); return;
    }
    const pwErr = validatePassword(password);
    if (pwErr) { Alert.alert('Weak password', pwErr); return; }
    if (password !== confirmPassword) { Alert.alert('Passwords do not match'); return; }

    try {
      await signUpWithEmail(email.trim(), password, name.trim());
      setVerificationSent(true);
    } catch { /* shown via error state */ }
  }

  if (verificationSent) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.successContent}>
          <Text style={styles.successIcon}>📧</Text>
          <Text style={styles.successTitle}>Check your email!</Text>
          <Text style={styles.successText}>We sent a verification link to {email}. Click it to activate your account, then come back to sign in.</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.primaryBtn}><Text style={styles.primaryBtnText}>Go to Sign In</Text></TouchableOpacity>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.pageTitle}>Create Account</Text>
          <Text style={styles.pageSubtitle}>Join AlgoViz+ and start learning</Text>

          {error && <View style={styles.errorBanner}><Text style={styles.errorText}>{error}</Text></View>}

          {[
            { label: 'Full Name', value: name, onChange: setName, placeholder: 'John Doe' },
            { label: 'Email', value: email, onChange: setEmail, placeholder: 'you@example.com', keyboardType: 'email-address' as const, autoCapitalize: 'none' as const },
            { label: 'Password', value: password, onChange: setPassword, placeholder: '••••••••', secure: true },
            { label: 'Confirm Password', value: confirmPassword, onChange: setConfirmPassword, placeholder: '••••••••', secure: true },
          ].map(({ label, value, onChange, placeholder, keyboardType, autoCapitalize, secure }) => (
            <View key={label} style={styles.field}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                placeholderTextColor="#6B6B8A"
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize ?? 'sentences'}
                secureTextEntry={secure}
                autoCorrect={false}
              />
            </View>
          ))}

          <TouchableOpacity style={[styles.primaryBtn, loading && styles.btnDisabled]} onPress={handleRegister} disabled={loading}>
            <Text style={styles.primaryBtnText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity><Text style={styles.loginLink}>Sign In</Text></TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 24, gap: 14 },
  successContent: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 16 },
  successIcon: { fontSize: 64 },
  successTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  successText: { color: '#9E9EB8', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  pageTitle: { color: '#FFFFFF', fontSize: 30, fontWeight: '900', marginTop: 12 },
  pageSubtitle: { color: '#9E9EB8', fontSize: 15, marginBottom: 8 },
  errorBanner: { backgroundColor: '#FF475722', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#FF4757' },
  errorText: { color: '#FF4757', fontSize: 13 },
  field: { gap: 6 },
  label: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  input: { backgroundColor: '#1E1E2E', color: '#FFFFFF', borderRadius: 14, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#2A2A4A' },
  primaryBtn: { backgroundColor: '#6C63FF', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
  loginText: { color: '#9E9EB8' },
  loginLink: { color: '#6C63FF', fontWeight: '700' },
});
```

---

## Root Layout & Auth Gate — app/_layout.tsx + app/index.tsx

```tsx
// app/_layout.tsx — Root layout with all providers
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { supabase } from '../src/lib/supabase/client';
import { useAuthStore } from '../src/features/auth/store/authStore';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true,
  }),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 30_000 },
    mutations: { retry: 0 },
  },
});

export default function RootLayout() {
  const { setSession, initialized } = useAuthStore();

  useEffect(() => {
    // Load existing session on app start
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      SplashScreen.hideAsync();
    });
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!initialized) return null; // Show splash until initialized

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="algorithm/[id]" options={{ headerShown: true, headerStyle: { backgroundColor: '#1E1E2E' }, headerTintColor: '#FFFFFF', title: '' }} />
          <Stack.Screen name="study-room/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="concept/[id]" options={{ headerShown: true, headerStyle: { backgroundColor: '#1E1E2E' }, headerTintColor: '#FFFFFF', title: 'Concept' }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

// ─────────────────────────────────────────────────────────────
// app/index.tsx — Auth gate redirect
// ─────────────────────────────────────────────────────────────

import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/features/auth/store/authStore';

export default function Index() {
  const { session, initialized } = useAuthStore();
  if (!initialized) return null;
  return <Redirect href={session ? '/(tabs)/home' : '/(auth)/login'} />;
}
```
