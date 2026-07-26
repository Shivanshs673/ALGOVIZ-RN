import { useState, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { supabase } from '../../../lib/supabase/client';
import { getGoogleRedirectUri } from '../googleOAuth';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '';

function getGoogleConfigError(): string | null {
  if (!WEB_CLIENT_ID || WEB_CLIENT_ID.includes('your-google')) {
    return 'Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in .env';
  }
  if (Platform.OS === 'ios' && !IOS_CLIENT_ID) {
    return 'Missing EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID — create an iOS OAuth client in Google Cloud Console (bundle: com.algoviz.plus).';
  }
  if (Platform.OS === 'android' && !ANDROID_CLIENT_ID) {
    return 'Missing EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID — create an Android OAuth client (package: com.algoviz.plus + SHA-1).';
  }
  return null;
}

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

  const configError = useMemo(() => getGoogleConfigError(), []);

  const redirectUri = useMemo(
    () => getGoogleRedirectUri(ANDROID_CLIENT_ID, IOS_CLIENT_ID),
    [],
  );

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID || undefined,
    androidClientId: ANDROID_CLIENT_ID || undefined,
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params.id_token;
      if (!idToken) {
        setError('Google did not return an ID token. Check OAuth client IDs in Google Cloud + Supabase.');
        return;
      }
      setLoading(true);
      supabase.auth
        .signInWithIdToken({ provider: 'google', token: idToken })
        .then(({ error: signInError }) => {
          if (signInError) {
            setError(signInError.message);
          }
        })
        .finally(() => setLoading(false));
    } else if (response?.type === 'error') {
      const msg = response.error?.message ?? response.params?.error_description ?? 'Google sign in failed';
      setError(msg);
    }
  }, [response]);

  async function signInWithGoogle() {
    const cfgErr = getGoogleConfigError();
    if (cfgErr) {
      setError(cfgErr);
      return;
    }
    setError(null);
    await promptAsync();
  }

  return {
    signInWithGoogle,
    loading,
    error: configError ?? error,
    disabled: !request || !!configError,
    redirectUri,
  };
}
