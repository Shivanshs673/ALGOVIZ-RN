import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { useEmailAuth, useGoogleAuth } from '../../src/features/auth/hooks/useAuth';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { signInWithEmail, loading, error, clearError } = useEmailAuth();
  const { signInWithGoogle, loading: googleLoading, disabled: googleDisabled, error: googleError } = useGoogleAuth();

  useEffect(() => {
    if (session) router.replace('/(tabs)/home');
  }, [session]);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter email and password');
      return;
    }
    try {
      await signInWithEmail(email.trim(), password);
      router.replace('/(tabs)/home');
    } catch {
      // Error shown in UI via error state
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>AV+</Text>
            </View>
            <Text style={styles.heroTitle}>AlgoViz+</Text>
            <Text style={styles.heroSubtitle}>Learn algorithms visually</Text>
          </View>

          <View style={styles.form}>
            {(error || googleError) && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error ?? googleError}</Text>
                <TouchableOpacity onPress={clearError}><Ionicons name="close" size={18} color="#FF4757" /></TouchableOpacity>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#6B6B8A"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#6B6B8A"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
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

            <TouchableOpacity style={[styles.primaryBtn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
              <Text style={styles.primaryBtnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.googleBtn, (googleLoading || googleDisabled) && styles.btnDisabled]}
              onPress={signInWithGoogle}
              disabled={googleLoading || googleDisabled}
            >
              <Text style={styles.googleBtnText}>🔵 Continue with Google</Text>
            </TouchableOpacity>
          </View>

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