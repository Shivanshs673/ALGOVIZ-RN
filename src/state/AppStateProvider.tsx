import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

export type AuthProvider = 'email' | 'google';

export type SessionUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarColorIndex: number;
  authProvider: AuthProvider;
};

type SessionStatus = 'loading' | 'signedOut' | 'signedIn';

type SessionState = {
  status: SessionStatus;
  user: SessionUser | null;
};

type AppStateContextValue = {
  session: SessionState;
  signIn: (provider: AuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<SessionUser, 'name' | 'username' | 'email' | 'avatarColorIndex'>>) => Promise<void>;
};

const SESSION_STORAGE_KEY = 'algoviz.session.v1';

const defaultUser: SessionUser = {
  id: 'mock-user-001',
  name: 'Shiva',
  username: 'shivansh',
  email: 'shiva@example.com',
  avatarColorIndex: 4,
  authProvider: 'email',
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<SessionState>({ status: 'loading', user: null });

  useEffect(() => {
    let cancelled = false;

    async function bootstrapSession() {
      try {
        const storedValue = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
        if (cancelled) {
          return;
        }

        if (!storedValue) {
          setSession({ status: 'signedOut', user: null });
          return;
        }

        const parsed = JSON.parse(storedValue) as SessionUser;
        setSession({ status: 'signedIn', user: parsed });
      } catch {
        if (!cancelled) {
          setSession({ status: 'signedOut', user: null });
        }
      }
    }

    void bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AppStateContextValue>(() => {
    return {
      session,
      signIn: async (provider) => {
        const nextUser: SessionUser = {
          ...defaultUser,
          authProvider: provider,
          email: provider === 'google' ? 'learner@googlemail.com' : defaultUser.email,
          avatarColorIndex: provider === 'google' ? 2 : defaultUser.avatarColorIndex,
        };

        setSession({ status: 'signedIn', user: nextUser });
        await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextUser));
      },
      signOut: async () => {
        setSession({ status: 'signedOut', user: null });
        await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
      },
      updateProfile: async (patch) => {
        setSession((current) => {
          if (!current.user) {
            return current;
          }

          const updatedUser = { ...current.user, ...patch };
          void AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
          return { ...current, user: updatedUser };
        });
      },
    };
  }, [session]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }

  return context;
}
