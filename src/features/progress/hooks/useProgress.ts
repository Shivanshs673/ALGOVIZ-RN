// Unified progress tracking: AsyncStorage (offline-first) + best-effort Supabase sync
import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase/client';
import { useAuthStore } from '../../auth/store/authStore';
import { UserProgress, ProgressSummary, CategoryProgress, RecentActivity } from '../../../types/user.types';
import { ALGORITHMS } from '../../algorithms/data/algorithmRegistry';

function progressKey(userId: string) {
  return `algoviz.progress.${userId}`;
}

function buildSummary(progressMap: Record<string, UserProgress>): ProgressSummary {
  const total = ALGORITHMS.length;
  const progressArr = Object.values(progressMap);
  const totalViewed = progressArr.filter((p) => p.viewed).length;
  const totalCompleted = progressArr.filter((p) => p.completed).length;

  const categoryMap: Record<string, { total: number; viewed: number; completed: number }> = {};
  for (const algo of ALGORITHMS) {
    if (!categoryMap[algo.category]) {
      categoryMap[algo.category] = { total: 0, viewed: 0, completed: 0 };
    }
    categoryMap[algo.category].total += 1;
    const prog = progressMap[algo.id];
    if (prog?.viewed) categoryMap[algo.category].viewed += 1;
    if (prog?.completed) categoryMap[algo.category].completed += 1;
  }

  const byCategory: CategoryProgress[] = Object.entries(categoryMap).map(([cat, v]) => ({
    category: cat,
    total: v.total,
    viewed: v.viewed,
    completed: v.completed,
    percent: v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0,
  }));

  const recentActivity: RecentActivity[] = progressArr
    .filter((p) => p.viewed && p.lastViewedAt)
    .sort((a, b) => (b.lastViewedAt ?? '').localeCompare(a.lastViewedAt ?? ''))
    .slice(0, 10)
    .map((p) => {
      const algo = ALGORITHMS.find((a) => a.id === p.algorithmId);
      return {
        algorithmId: p.algorithmId,
        algorithmName: algo?.name ?? p.algorithmId,
        lastViewedAt: p.lastViewedAt ?? '',
      };
    });

  return {
    totalAlgorithms: total,
    totalViewed,
    totalCompleted,
    overallPercent: total > 0 ? Math.round((totalCompleted / total) * 100) : 0,
    byCategory,
    recentActivity,
  };
}

async function syncToSupabase(userId: string, progress: UserProgress) {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('user_progress').upsert(
      {
        user_id: userId,
        algorithm_id: progress.algorithmId,
        viewed: progress.viewed,
        completed: progress.completed,
        view_count: progress.viewCount,
        last_viewed_at: progress.lastViewedAt ?? new Date().toISOString(),
      },
      { onConflict: 'user_id,algorithm_id' },
    );
  } catch {
    // Table may not exist yet — local storage remains source of truth
  }
}

export function useProgress() {
  const user = useAuthStore((s) => s.user);
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProgressMap({});
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const raw = await AsyncStorage.getItem(progressKey(user!.id));
        if (raw && !cancelled) {
          setProgressMap(JSON.parse(raw));
        }

        if (isSupabaseConfigured) {
          const { data, error } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user!.id);
          if (!error && data && !cancelled) {
            const remote: Record<string, UserProgress> = {};
            for (const row of data) {
              remote[row.algorithm_id] = {
                algorithmId: row.algorithm_id,
                viewed: row.viewed ?? false,
                completed: row.completed ?? false,
                viewCount: row.view_count ?? 0,
                lastViewedAt: row.last_viewed_at ?? undefined,
              };
            }
            const merged = { ...(raw ? JSON.parse(raw) : {}), ...remote };
            setProgressMap(merged);
            await AsyncStorage.setItem(progressKey(user!.id), JSON.stringify(merged));
          }
        }
      } catch {
        // keep empty map
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const saveProgress = useCallback(
    async (patch: Record<string, UserProgress>, changedId?: string) => {
      if (!user) return;
      setProgressMap(patch);
      await AsyncStorage.setItem(progressKey(user.id), JSON.stringify(patch));
      if (changedId && patch[changedId]) {
        void syncToSupabase(user.id, patch[changedId]);
      }
    },
    [user?.id],
  );

  const markViewed = useCallback(
    async (algorithmId: string) => {
      if (!user) return;
      const now = new Date().toISOString();
      const existing = progressMap[algorithmId] ?? {
        algorithmId,
        viewed: false,
        completed: false,
        viewCount: 0,
      };
      const next = {
        ...progressMap,
        [algorithmId]: {
          ...existing,
          viewed: true,
          viewCount: existing.viewCount + 1,
          lastViewedAt: now,
        },
      };
      await saveProgress(next, algorithmId);
    },
    [progressMap, saveProgress, user],
  );

  const markCompleted = useCallback(
    async (algorithmId: string) => {
      if (!user) return;
      const now = new Date().toISOString();
      const existing = progressMap[algorithmId] ?? {
        algorithmId,
        viewed: true,
        completed: false,
        viewCount: 1,
      };
      const next = {
        ...progressMap,
        [algorithmId]: {
          ...existing,
          viewed: true,
          completed: true,
          lastViewedAt: now,
        },
      };
      await saveProgress(next, algorithmId);
    },
    [progressMap, saveProgress, user],
  );

  const isViewed = useCallback(
    (algorithmId: string) => !!progressMap[algorithmId]?.viewed,
    [progressMap],
  );

  const isCompleted = useCallback(
    (algorithmId: string) => !!progressMap[algorithmId]?.completed,
    [progressMap],
  );

  return {
    progressMap,
    loading,
    summary: buildSummary(progressMap),
    isViewed,
    isCompleted,
    markViewed,
    markCompleted,
  };
}
