import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      try {
        return Promise.resolve(localStorage.getItem(key));
      } catch {
        return Promise.resolve(null);
      }
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch {
        // ignore quota errors
      }
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const isConfigured =
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20 &&
  !supabaseAnonKey.includes('your-supabase-anon-key');

if (!isConfigured && __DEV__) {
  console.warn(
    '[AlgoViz+] Missing Supabase credentials. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env',
  );
}

export const isSupabaseConfigured = isConfigured;

/** Shown on login when the installed build was compiled without EAS env vars. */
export function getSupabaseConfigError(): string | null {
  if (isConfigured) return null;
  return 'This build is missing Supabase credentials. Rebuild the app on EAS after adding preview/production environment variables.';
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.invalid',
  supabaseAnonKey || 'missing-anon-key',
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
