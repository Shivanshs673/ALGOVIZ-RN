// src/features/presence/useGlobalPresence.ts
// Global heartbeat that updates user_presence table every 25 seconds
// This keeps the "online" status accurate for all users across the app

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '../../lib/supabase/client';
import { useAuthStore } from '../auth/store/authStore';

const HEARTBEAT_INTERVAL_MS = 25_000; // 25 seconds

export function useGlobalPresence() {
  const user = useAuthStore(s => s.user);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  async function updatePresence(isOnline: boolean) {
    if (!user) return;
    try {
      await supabase
        .from('user_presence')
        .upsert(
          {
            user_id: user.id,
            is_online: isOnline,
            last_seen_at: Date.now(),
          },
          { onConflict: 'user_id' }
        );
    } catch {
      // Non-fatal — presence is best-effort
    }
  }

  useEffect(() => {
    if (!user) return;

    // Mark online immediately
    updatePresence(true);

    // Heartbeat every 25s while app is in foreground
    timerRef.current = setInterval(() => {
      if (appStateRef.current === 'active') {
        updatePresence(true);
      }
    }, HEARTBEAT_INTERVAL_MS);

    // Handle app going background/foreground
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;

      if (nextState === 'active' && prevState !== 'active') {
        // Came back to foreground
        updatePresence(true);
      } else if (nextState === 'background' || nextState === 'inactive') {
        // Going to background
        updatePresence(false);
      }
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      subscription.remove();
      // Mark offline on cleanup (best effort)
      updatePresence(false);
    };
  }, [user?.id]);
}
