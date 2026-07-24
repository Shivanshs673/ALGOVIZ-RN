// src/features/profile/api/profileApi.ts
// Aligned to ERD: docs/04_ERD.md — user_profiles table

import { supabase } from '../../../lib/supabase/client';
import { UserProfile, UpdateProfileInput } from '../../../types/user.types';
import { uploadProfileAvatar } from './avatarUpload';

function mapProfile(row: Record<string, unknown>): UserProfile {
  return {
    userId: String(row.user_id),
    name: String(row.name ?? ''),
    username: String(row.username ?? ''),
    email: String(row.email ?? ''),
    phoneNo: String(row.phone_no ?? ''),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    avatarColorIndex: Number(row.avatar_color_index ?? 0),
    updatedAt: row.updated_at ? Number(row.updated_at) : undefined,
  };
}

export const profileApi = {
  get: async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data ? mapProfile(data) : null;
  },

  upsert: async (
    userId: string,
    input: Partial<UpdateProfileInput> & { email?: string; name?: string },
  ): Promise<UserProfile> => {
    const payload: Record<string, unknown> = {
      user_id: userId,
      updated_at: Date.now(),
    };
    if (input.name !== undefined) payload.name = input.name.trim();
    if (input.username !== undefined) payload.username = input.username.trim().toLowerCase();
    if (input.email !== undefined) payload.email = input.email.trim();
    if (input.phoneNo !== undefined) payload.phone_no = input.phoneNo.trim();
    if (input.avatarColorIndex !== undefined) payload.avatar_color_index = input.avatarColorIndex;

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();
    if (error) throw error;
    return mapProfile(data);
  },

  update: async (userId: string, input: UpdateProfileInput): Promise<UserProfile> => {
    const updateData: Record<string, unknown> = { updated_at: Date.now() };
    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.username !== undefined) updateData.username = input.username.trim().toLowerCase();
    if (input.email !== undefined) updateData.email = input.email.trim();
    if (input.phoneNo !== undefined) updateData.phone_no = input.phoneNo.trim();
    if (input.avatarColorIndex !== undefined) updateData.avatar_color_index = input.avatarColorIndex;

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return mapProfile(data);
  },

  uploadAvatar: (userId: string, localUri: string, mimeType?: string | null) =>
    uploadProfileAvatar(userId, localUri, mimeType),
};
