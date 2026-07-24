// Resilient profile hook — creates fallback from auth when Supabase fails

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@supabase/supabase-js';
import { profileApi } from '../api/profileApi';
import { useAuthStore } from '../../auth/store/authStore';
import { UpdateProfileInput, UserProfile } from '../../../types/user.types';
import { isSupabaseConfigured } from '../../../lib/supabase/client';

function avatarCacheKey(userId: string) {
  return `algoviz.avatar.${userId}`;
}

function buildFallbackProfile(user: User, localAvatar?: string): UserProfile {
  const meta = user.user_metadata ?? {};
  const displayName =
    meta.name ?? meta.full_name ?? user.email?.split('@')[0] ?? 'User';
  return {
    userId: user.id,
    name: displayName,
    username: displayName.toLowerCase().replace(/\s+/g, '_').slice(0, 24),
    email: user.email ?? '',
    phoneNo: '',
    avatarUrl: localAvatar ?? meta.avatar_url ?? meta.picture ?? undefined,
    avatarColorIndex: Math.abs(user.id.charCodeAt(0) % 8),
    updatedAt: Date.now(),
  };
}

async function fetchOrCreateProfile(user: User): Promise<UserProfile> {
  const cachedAvatar = await AsyncStorage.getItem(avatarCacheKey(user.id)).catch(() => null);

  if (!isSupabaseConfigured) {
    return buildFallbackProfile(user, cachedAvatar ?? undefined);
  }

  try {
    const existing = await profileApi.get(user.id);
    if (existing) {
      if (cachedAvatar && !existing.avatarUrl?.startsWith('http')) {
        return { ...existing, avatarUrl: cachedAvatar };
      }
      return existing;
    }

    const meta = user.user_metadata ?? {};
    const displayName =
      meta.name ?? meta.full_name ?? user.email?.split('@')[0] ?? 'User';

    return await profileApi.upsert(user.id, {
      name: displayName,
      username: `user_${user.id.replace(/-/g, '').slice(0, 12)}`,
      email: user.email ?? '',
      avatarColorIndex: Math.abs(user.id.charCodeAt(0) % 8),
    });
  } catch {
    return buildFallbackProfile(user, cachedAvatar ?? undefined);
  }
}

export function useProfile() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<UserProfile> => {
      if (!user) throw new Error('Not authenticated');
      return fetchOrCreateProfile(user);
    },
    enabled: !!user?.id,
    staleTime: 60_000,
    retry: 1,
  });

  const updateMutation = useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      if (!user) throw new Error('Not authenticated');
      if (!isSupabaseConfigured) {
        const current = profile ?? buildFallbackProfile(user);
        return { ...current, ...input, updatedAt: Date.now() } as UserProfile;
      }
      return profileApi.update(user.id, input);
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile', user?.id], updatedProfile);
      setIsEditing(false);
    },
  });

  async function uploadAvatar(localUri: string, mimeType?: string | null): Promise<void> {
    if (!user) return;
    setUploadingAvatar(true);

    // Always cache locally so the photo shows even if cloud upload fails
    await AsyncStorage.setItem(avatarCacheKey(user.id), localUri).catch(() => undefined);
    queryClient.setQueryData<UserProfile>(['profile', user.id], (old) => {
      const base = old ?? buildFallbackProfile(user);
      return { ...base, avatarUrl: localUri };
    });

    try {
      if (!isSupabaseConfigured) return;

      const newUrl = await profileApi.uploadAvatar(user.id, localUri, mimeType);
      await AsyncStorage.setItem(avatarCacheKey(user.id), newUrl).catch(() => undefined);
      queryClient.setQueryData<UserProfile>(['profile', user.id], (old) =>
        old ? { ...old, avatarUrl: newUrl } : old,
      );
    } catch (err) {
      // Local preview already set — rethrow so UI can show cloud error
      throw err;
    } finally {
      setUploadingAvatar(false);
    }
  }

  const resolvedProfile = profile ?? (user ? buildFallbackProfile(user) : undefined);

  return {
    profile: resolvedProfile,
    isLoading: isLoading && !resolvedProfile,
    isError,
    refetch,
    isEditing,
    setIsEditing,
    uploadingAvatar,
    uploadAvatar,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    isOfflineProfile: !isSupabaseConfigured || isError,
  };
}
