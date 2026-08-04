import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';

/** Redirect URI passed to Supabase OAuth — must match Supabase Auth → URL Configuration. */
export function getAuthRedirectUri(): string {
  if (Platform.OS === 'web') {
    return makeRedirectUri({ path: 'auth/callback' });
  }
  return makeRedirectUri({ scheme: 'algovizplus', path: 'auth/callback' });
}
