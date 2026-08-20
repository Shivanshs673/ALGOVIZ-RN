// app/_layout.tsx
// Root layout — sets up auth state listener, QueryClient, providers, and global presence

import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { Stack, SplashScreen, useRouter } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from '../src/lib/supabase/client';
import { useAuthStore } from '../src/features/auth/store/authStore';
import { useGlobalPresence } from '../src/features/presence/useGlobalPresence';
import {
  createSessionFromUrl,
  getInitialAuthUrl,
  isAuthRecoveryUrl,
  isOAuthCallbackUrl,
} from '../src/features/auth/deepLinkAuth';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
      refetchOnWindowFocus: false, // RN has no window focus concept
    },
    mutations: { retry: 0 },
  },
});

function PresenceController() {
  // This component just runs the global presence hook inside the auth context
  useGlobalPresence();
  return null;
}

export default function RootLayout() {
  const router = useRouter();
  const { setSession, initialized, session } = useAuthStore();

  useEffect(() => {
    async function handleAuthUrl(url: string) {
      if (isOAuthCallbackUrl(url)) {
        try {
          const oauthSession = await createSessionFromUrl(url);
          if (oauthSession) setSession(oauthSession);
        } catch {
          // OAuth deep link failed — user can retry from login
        }
        return;
      }

      if (!isAuthRecoveryUrl(url)) return;
      try {
        const recoverySession = await createSessionFromUrl(url);
        if (recoverySession) {
          setSession(recoverySession);
          router.push('/(auth)/password-reset');
        }
      } catch {
        router.push('/(auth)/forgot-password');
      }
    }

    // Load persisted session on startup
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
      })
      .catch(() => {
        // Never block app startup if secure storage/session restoration fails.
        setSession(null);
      })
      .finally(() => {
        SplashScreen.hideAsync().catch(() => undefined);
      });

    getInitialAuthUrl()
      .then((url) => {
        if (url) return handleAuthUrl(url);
      })
      .catch(() => {
        // Ignore malformed startup deep links.
      });

    const linkSub = Linking.addEventListener('url', ({ url }) => {
      handleAuthUrl(url);
    });

    // Subscribe to future auth state changes (sign-in, sign-out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, newSession) => {
      setSession(newSession);
    });

    return () => {
      subscription.unsubscribe();
      linkSub.remove();
    };
  }, []);

  // Hold splash until Supabase session is determined
  if (!initialized) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          {/* Run global presence heartbeat whenever user is signed in */}
          {session && <PresenceController />}

          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="algorithm/[id]"
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: '#1E1E2E' },
                headerTintColor: '#FFFFFF',
                title: '',
              }}
            />
            <Stack.Screen name="study-room/[id]" options={{ headerShown: false }} />
            <Stack.Screen
              name="concept/[id]"
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: '#1E1E2E' },
                headerTintColor: '#FFFFFF',
                title: 'Concept',
              }}
            />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
