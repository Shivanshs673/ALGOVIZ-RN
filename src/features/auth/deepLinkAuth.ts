import * as Linking from 'expo-linking';
import { supabase } from '../../lib/supabase/client';

function parseAuthParams(url: string): Record<string, string> {
  const hashIndex = url.indexOf('#');
  const queryIndex = url.indexOf('?');
  const paramString =
    hashIndex >= 0
      ? url.slice(hashIndex + 1)
      : queryIndex >= 0
        ? url.slice(queryIndex + 1)
        : '';

  const params: Record<string, string> = {};
  for (const part of paramString.split('&')) {
    if (!part) continue;
    const [key, value = ''] = part.split('=');
    params[decodeURIComponent(key)] = decodeURIComponent(value);
  }
  return params;
}

export function isOAuthCallbackUrl(url: string): boolean {
  return url.includes('auth/callback');
}

export function isAuthRecoveryUrl(url: string): boolean {
  if (isOAuthCallbackUrl(url)) return false;
  return (
    url.includes('password-reset') ||
    url.includes('type=recovery')
  );
}

export async function createSessionFromUrl(url: string) {
  const params = parseAuthParams(url);
  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;

  if (!accessToken || !refreshToken) {
    return null;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) throw error;
  return data.session;
}

export async function getInitialAuthUrl(): Promise<string | null> {
  return Linking.getInitialURL();
}
