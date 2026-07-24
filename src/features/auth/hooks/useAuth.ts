import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'algovizplus://password-reset',
      });
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
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!,
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