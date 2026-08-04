import { useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase, getSupabaseConfigError, isSupabaseConfigured } from '../../../lib/supabase/client';
import { getAuthRedirectUri } from '../googleOAuth';
import { createSessionFromUrl } from '../deepLinkAuth';

WebBrowser.maybeCompleteAuthSession();

export function useEmailAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithEmail(email: string, password: string): Promise<void> {
    setLoading(true); setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sign in failed';
      setError(msg);
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sign up failed';
      setError(msg);
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Reset failed';
      setError(msg);
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

  const configError = getSupabaseConfigError();
  const redirectUri = getAuthRedirectUri();

  async function signInWithGoogle() {
    const cfgErr = getSupabaseConfigError();
    if (cfgErr) {
      setError(cfgErr);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (Platform.OS === 'web') {
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: redirectUri },
        });
        if (oauthError) throw oauthError;
        return;
      }

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });
      if (oauthError) throw oauthError;
      if (!data?.url) throw new Error('Supabase did not return a Google sign-in URL.');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
      if (result.type === 'cancel' || result.type === 'dismiss') return;
      if (result.type !== 'success') {
        throw new Error('Google sign in was not completed.');
      }

      const session = await createSessionFromUrl(result.url);
      if (!session) {
        throw new Error(
          'Sign in completed but no session was returned. Add algovizplus://auth/callback to Supabase Auth → Redirect URLs.',
        );
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Google sign in failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return {
    signInWithGoogle,
    loading,
    error: configError ?? error,
    disabled: !isSupabaseConfigured || !!configError,
    redirectUri,
  };
}
