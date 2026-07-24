import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
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
      Alert.alert('Missing fields', 'Please fill in all fields');
      return;
    }
    const pwErr = validatePassword(password);
    if (pwErr) {
      Alert.alert('Weak password', pwErr);
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }

    try {
      await signUpWithEmail(email.trim(), password, name.trim());
      setVerificationSent(true);
    } catch {
      // Error is shown via error state in UI
    }
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