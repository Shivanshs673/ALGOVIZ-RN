import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { useEmailAuth } from '../../src/features/auth/hooks/useAuth';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const { resetPassword, loading, error, clearError } = useEmailAuth();

  async function handleReset() {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch {
      // Error shown in UI
    }
  }

  if (resetSent) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.successContent}>
          <Text style={styles.successIcon}>🔑</Text>
          <Text style={styles.successTitle}>Check your inbox</Text>
          <Text style={styles.successText}>We sent a password reset link to {email}. Follow the instructions to create a new password.</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.primaryBtn}><Text style={styles.primaryBtnText}>Back to Sign In</Text></TouchableOpacity>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.pageTitle}>Reset Password</Text>
          <Text style={styles.pageSubtitle}>Enter your email to receive a password reset link</Text>

          {error && <View style={styles.errorBanner}><Text style={styles.errorText}>{error}</Text></View>}

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

          <TouchableOpacity style={[styles.primaryBtn, loading && styles.btnDisabled]} onPress={handleReset} disabled={loading}>
            <Text style={styles.primaryBtnText}>{loading ? 'Sending link...' : 'Send Reset Link'}</Text>
          </TouchableOpacity>

          <View style={styles.backRow}>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity><Text style={styles.backLink}>Back to Sign In</Text></TouchableOpacity>
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
  backRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
  backLink: { color: '#6C63FF', fontWeight: '700' },
});