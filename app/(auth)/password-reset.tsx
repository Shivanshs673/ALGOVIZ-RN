import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase/client';
import { useAuthStore } from '../../src/features/auth/store/authStore';

export default function PasswordResetScreen() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleUpdatePassword() {
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      Alert.alert('Success', 'Your password has been updated.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/home') },
      ]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not update password';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.subtitle}>Verifying reset link...</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.linkBtn}>
              <Text style={styles.linkText}>Back to Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Text style={styles.title}>Set New Password</Text>
          <Text style={styles.subtitle}>Choose a strong password for your account.</Text>

          <View style={styles.field}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholder="••••••••"
              placeholderTextColor="#6B6B8A"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholder="••••••••"
              placeholderTextColor="#6B6B8A"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleUpdatePassword}
            disabled={loading}
          >
            <Text style={styles.primaryBtnText}>{loading ? 'Updating...' : 'Update Password'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  content: { flex: 1, padding: 24, gap: 14, justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '900' },
  subtitle: { color: '#9E9EB8', fontSize: 15, lineHeight: 22 },
  field: { gap: 6 },
  label: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  input: {
    backgroundColor: '#1E1E2E',
    color: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  primaryBtn: { backgroundColor: '#6C63FF', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  linkBtn: { marginTop: 8 },
  linkText: { color: '#6C63FF', fontWeight: '700' },
});
