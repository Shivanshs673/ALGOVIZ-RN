# Profile Feature — Full Code
**Files:**
- `src/features/profile/api/profileApi.ts`
- `src/features/profile/hooks/useProfile.ts`
- `src/features/progress/hooks/useProgress.ts`
- `app/(tabs)/profile.tsx`
- `app/(tabs)/progress.tsx`

---

## profileApi.ts

```typescript
import { supabase } from '../../../lib/supabase/client';
import { UserProfile, UpdateProfileInput } from '../../../types/user.types';

function mapProfile(row: any): UserProfile {
  return {
    userId: row.user_id,
    name: row.name ?? '',
    username: row.username ?? '',
    email: row.email ?? '',
    bio: row.bio ?? '',
    skillLevel: row.skill_level ?? 'BEGINNER',
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const profileApi = {
  // Get profile by userId
  get: async (userId: string): Promise<UserProfile> => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return mapProfile(data);
  },

  // Update profile fields
  update: async (userId: string, input: UpdateProfileInput): Promise<UserProfile> => {
    const updateData: Record<string, any> = {};
    if (input.name !== undefined)       updateData.name = input.name.trim();
    if (input.username !== undefined)   updateData.username = input.username.trim().toLowerCase();
    if (input.bio !== undefined)        updateData.bio = input.bio.trim();
    if (input.skillLevel !== undefined) updateData.skill_level = input.skillLevel;

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return mapProfile(data);
  },

  // Upload avatar and update profile
  uploadAvatar: async (userId: string, localUri: string): Promise<string> => {
    // Read file as base64
    const { readAsStringAsync, EncodingType } = await import('expo-file-system');
    const base64 = await readAsStringAsync(localUri, { encoding: EncodingType.Base64 });

    // Decode base64 to ArrayBuffer for Supabase Storage
    const { decode } = await import('base64-arraybuffer');
    const ext = localUri.split('.').pop() ?? 'jpg';
    const storagePath = `profile_images/${userId}/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from('Algoviz')
      .upload(storagePath, decode(base64), {
        contentType: `image/${ext}`,
        upsert: true,
      });
    if (uploadErr) throw uploadErr;

    const { data } = supabase.storage.from('Algoviz').getPublicUrl(storagePath);
    const publicUrl = data.publicUrl;

    await supabase
      .from('user_profiles')
      .update({ avatar_url: publicUrl })
      .eq('user_id', userId);

    return publicUrl;
  },

  // Delete old avatar from storage
  deleteAvatar: async (avatarUrl: string): Promise<void> => {
    // Extract path from URL
    const urlParts = avatarUrl.split('/storage/v1/object/public/Algoviz/');
    if (urlParts.length < 2) return;
    await supabase.storage.from('Algoviz').remove([urlParts[1]]);
  },
};
```

---

## useProfile.ts

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { profileApi } from '../api/profileApi';
import { useAuthStore } from '../../auth/store/authStore';
import { UpdateProfileInput, UserProfile } from '../../../types/user.types';

export function useProfile() {
  const user = useAuthStore(s => s.user);
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => profileApi.get(user!.id),
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  // Update profile fields
  const updateMutation = useMutation({
    mutationFn: (input: UpdateProfileInput) => profileApi.update(user!.id, input),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile', user?.id], updatedProfile);
      setIsEditing(false);
    },
  });

  // Upload avatar
  async function uploadAvatar(localUri: string): Promise<void> {
    if (!user) return;
    setUploadingAvatar(true);
    try {
      const newUrl = await profileApi.uploadAvatar(user.id, localUri);
      // Update cache
      queryClient.setQueryData<UserProfile>(['profile', user.id], (old) =>
        old ? { ...old, avatarUrl: newUrl } : old
      );
    } finally {
      setUploadingAvatar(false);
    }
  }

  return {
    profile,
    isLoading,
    isEditing,
    setIsEditing,
    uploadingAvatar,
    uploadAvatar,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
}
```

---

## useProgress.ts

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase/client';
import { useAuthStore } from '../../auth/store/authStore';
import { UserProgress, UpsertProgressInput, ProgressSummary } from '../../../types/user.types';
import { ALGORITHMS, ALGORITHMS_PER_CATEGORY } from '../../algorithms/data/algorithmRegistry';

function mapProgress(row: any): UserProgress {
  return {
    id: row.id,
    userId: row.user_id,
    algorithmId: row.algorithm_id,
    viewed: row.viewed ?? false,
    completed: row.completed ?? false,
    viewCount: row.view_count ?? 0,
    lastViewedAt: row.last_viewed_at,
    createdAt: row.created_at,
  };
}

export function useProgress() {
  const user = useAuthStore(s => s.user);
  const queryClient = useQueryClient();

  const { data: progressList = [] } = useQuery({
    queryKey: ['progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data ?? []).map(mapProgress);
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  // Upsert progress (mark viewed / completed)
  const upsertMutation = useMutation({
    mutationFn: async (input: UpsertProgressInput) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          algorithm_id: input.algorithmId,
          viewed: input.viewed ?? true,
          completed: input.completed ?? false,
          last_viewed_at: new Date().toISOString(),
          view_count: (progressList.find(p => p.algorithmId === input.algorithmId)?.viewCount ?? 0) + 1,
        }, { onConflict: 'user_id,algorithm_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', user?.id] });
    },
  });

  // Helper: is algorithm viewed
  function isViewed(algorithmId: string): boolean {
    return progressList.some(p => p.algorithmId === algorithmId && p.viewed);
  }

  function isCompleted(algorithmId: string): boolean {
    return progressList.some(p => p.algorithmId === algorithmId && p.completed);
  }

  // Compute summary
  const summary: ProgressSummary = {
    totalAlgorithms: ALGORITHMS.length,
    totalViewed: progressList.filter(p => p.viewed).length,
    totalCompleted: progressList.filter(p => p.completed).length,
    overallPercent: Math.round((progressList.filter(p => p.viewed).length / ALGORITHMS.length) * 100),
    byCategory: Object.entries(ALGORITHMS_PER_CATEGORY).map(([category, total]) => {
      const viewed = progressList.filter(p => p.viewed && ALGORITHMS.find(a => a.id === p.algorithmId)?.category === category).length;
      const completed = progressList.filter(p => p.completed && ALGORITHMS.find(a => a.id === p.algorithmId)?.category === category).length;
      return { category, total, viewed, completed, percent: Math.round((viewed / total) * 100) };
    }),
    recentActivity: progressList
      .filter(p => p.lastViewedAt && p.viewed)
      .sort((a, b) => new Date(b.lastViewedAt!).getTime() - new Date(a.lastViewedAt!).getTime())
      .slice(0, 10)
      .map(p => ({
        algorithmId: p.algorithmId,
        algorithmName: ALGORITHMS.find(a => a.id === p.algorithmId)?.name ?? p.algorithmId,
        lastViewedAt: p.lastViewedAt!,
      })),
  };

  return {
    progressList,
    summary,
    isViewed,
    isCompleted,
    markViewed: (algorithmId: string) => upsertMutation.mutateAsync({ algorithmId, viewed: true }),
    markCompleted: (algorithmId: string) => upsertMutation.mutateAsync({ algorithmId, viewed: true, completed: true }),
  };
}
```

---

## Profile Screen — app/(tabs)/profile.tsx

```tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '../../src/features/profile/hooks/useProfile';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { Avatar } from '../../src/shared/components/Avatar';
import { SkillLevel, UpdateProfileInput } from '../../src/types/user.types';
import { Ionicons } from '@expo/vector-icons';

const SKILL_LEVELS: SkillLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const SKILL_COLORS: Record<SkillLevel, string> = { BEGINNER: '#43C59E', INTERMEDIATE: '#FFB347', ADVANCED: '#FF4757' };

export default function ProfileScreen() {
  const { profile, isLoading, isEditing, setIsEditing, uploadAvatar, uploadingAvatar, updateProfile, isUpdating } = useProfile();
  const { signOut, user } = useAuthStore();

  // Local edit state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('BEGINNER');

  function startEditing() {
    if (!profile) return;
    setName(profile.name);
    setUsername(profile.username);
    setBio(profile.bio);
    setSkillLevel(profile.skillLevel);
    setIsEditing(true);
  }

  async function saveProfile() {
    const input: UpdateProfileInput = { name, username, bio, skillLevel };
    try {
      await updateProfile(input);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to save profile');
    }
  }

  async function pickAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to upload your avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      try {
        await uploadAvatar(result.assets[0].uri);
      } catch (e: any) {
        Alert.alert('Upload failed', e.message);
      }
    }
  }

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  }

  if (isLoading || !profile) {
    return <View style={styles.center}><Text style={styles.loadingText}>Loading profile...</Text></View>;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickAvatar} disabled={uploadingAvatar} style={styles.avatarWrapper}>
            <Avatar
              name={profile.name}
              avatarUrl={profile.avatarUrl}
              size={96}
              style={styles.avatar}
            />
            <View style={styles.avatarEditBadge}>
              <Ionicons name={uploadingAvatar ? 'reload' : 'camera'} size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          {uploadingAvatar && <Text style={styles.uploadingText}>Uploading...</Text>}
        </View>

        {/* Profile card */}
        <View style={styles.card}>
          {!isEditing ? (
            // View mode
            <>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>{profile.name}</Text>
                <TouchableOpacity onPress={startEditing} style={styles.editBtn}>
                  <Ionicons name="pencil" size={16} color="#6C63FF" />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.username}>@{profile.username}</Text>
              <Text style={styles.email}>{profile.email}</Text>
              {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
              <View style={[styles.skillBadge, { backgroundColor: SKILL_COLORS[profile.skillLevel] + '22' }]}>
                <Text style={[styles.skillText, { color: SKILL_COLORS[profile.skillLevel] }]}>{profile.skillLevel}</Text>
              </View>
              <Text style={styles.joinedText}>
                Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </Text>
            </>
          ) : (
            // Edit mode
            <>
              <Text style={styles.editTitle}>Edit Profile</Text>
              <InputField label="Display Name" value={name} onChange={setName} placeholder="Your name" />
              <InputField label="Username" value={username} onChange={setUsername} placeholder="@username" autoCapitalize="none" />
              <InputField label="Bio" value={bio} onChange={setBio} placeholder="Tell us about yourself..." multiline />

              {/* Skill level selector */}
              <Text style={styles.fieldLabel}>Skill Level</Text>
              <View style={styles.skillRow}>
                {SKILL_LEVELS.map(level => (
                  <TouchableOpacity key={level} onPress={() => setSkillLevel(level)}
                    style={[styles.skillOption, skillLevel === level && { backgroundColor: SKILL_COLORS[level] }]}>
                    <Text style={[styles.skillOptionText, skillLevel === level && { color: '#FFFFFF', fontWeight: '700' }]}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Buttons */}
              <View style={styles.editActions}>
                <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelEditBtn}>
                  <Text style={styles.cancelEditText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveProfile} disabled={isUpdating} style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>{isUpdating ? 'Saving...' : 'Save Changes'}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard label="Algorithms\nViewed" value={profile.userId ? '—' : '0'} color="#6C63FF" />
          <StatCard label="Study Rooms\nJoined" value="—" color="#43C59E" />
          <StatCard label="Concepts\nLearned" value="—" color="#FFB347" />
        </View>

        {/* Sign out */}
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
          <Ionicons name="log-out-outline" size={20} color="#FF4757" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function InputField({ label, value, onChange, placeholder, multiline, autoCapitalize }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; multiline?: boolean; autoCapitalize?: 'none' | 'sentences';
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput style={[styles.fieldInput, multiline && styles.fieldTextArea]} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#6B6B8A" multiline={multiline} numberOfLines={multiline ? 3 : 1} autoCapitalize={autoCapitalize ?? 'sentences'} />
    </View>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color, borderTopWidth: 3 }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#9E9EB8' },
  avatarSection: { alignItems: 'center', gap: 8 },
  avatarWrapper: { position: 'relative' },
  avatar: {},
  avatarEditBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#6C63FF', borderRadius: 20, width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#121212' },
  uploadingText: { color: '#9E9EB8', fontSize: 12 },
  card: { backgroundColor: '#1E1E2E', borderRadius: 20, padding: 20, gap: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileName: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#2A2A4A', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  editBtnText: { color: '#6C63FF', fontWeight: '600' },
  username: { color: '#6C63FF', fontSize: 14 },
  email: { color: '#9E9EB8', fontSize: 13 },
  bio: { color: '#CCCCDD', fontSize: 14, lineHeight: 20 },
  skillBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  skillText: { fontSize: 12, fontWeight: '700' },
  joinedText: { color: '#6B6B8A', fontSize: 12 },
  editTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  fieldGroup: { gap: 6 },
  fieldLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  fieldInput: { backgroundColor: '#2A2A4A', color: '#FFFFFF', borderRadius: 12, padding: 12, fontSize: 15 },
  fieldTextArea: { height: 80, textAlignVertical: 'top' },
  skillRow: { flexDirection: 'row', gap: 8 },
  skillOption: { flex: 1, borderRadius: 10, paddingVertical: 8, alignItems: 'center', backgroundColor: '#2A2A4A' },
  skillOptionText: { color: '#9E9EB8', fontSize: 12 },
  editActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelEditBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: '#2A2A4A' },
  cancelEditText: { color: '#9E9EB8', fontWeight: '600' },
  saveBtn: { flex: 2, borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: '#6C63FF' },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, backgroundColor: '#1E1E2E', borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { color: '#9E9EB8', fontSize: 11, textAlign: 'center', lineHeight: 16 },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FF475722', borderRadius: 14, padding: 14 },
  signOutText: { color: '#FF4757', fontWeight: '700', fontSize: 15 },
});
```

---

## Progress Screen — app/(tabs)/progress.tsx

```tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProgress } from '../../src/features/progress/hooks/useProgress';
import { formatDistanceToNow } from 'date-fns';

export default function ProgressScreen() {
  const { summary } = useProgress();

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>My Progress</Text>

        {/* Overall progress */}
        <View style={styles.overallCard}>
          <Text style={styles.overallPercent}>{summary.overallPercent}%</Text>
          <Text style={styles.overallLabel}>Overall Completion</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${summary.overallPercent}%` }]} />
          </View>
          <View style={styles.statsRow}>
            <StatPill label="Viewed"    value={summary.totalViewed}    max={summary.totalAlgorithms} color="#6C63FF" />
            <StatPill label="Completed" value={summary.totalCompleted} max={summary.totalAlgorithms} color="#43C59E" />
          </View>
        </View>

        {/* Category breakdown */}
        <Text style={styles.sectionTitle}>By Category</Text>
        {summary.byCategory.map(cat => (
          <View key={cat.category} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>{cat.category.replace(/_/g, ' ')}</Text>
              <Text style={styles.categoryPercent}>{cat.percent}%</Text>
            </View>
            <View style={styles.categoryBarBg}>
              <View style={[styles.categoryBarFill, { width: `${cat.percent}%` }]} />
            </View>
            <Text style={styles.categoryCount}>{cat.viewed}/{cat.total} viewed</Text>
          </View>
        ))}

        {/* Recent activity */}
        {summary.recentActivity.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {summary.recentActivity.map((item, i) => (
              <View key={i} style={styles.activityItem}>
                <View style={styles.activityDot} />
                <View style={styles.activityInfo}>
                  <Text style={styles.activityName}>{item.algorithmName}</Text>
                  <Text style={styles.activityTime}>{formatDistanceToNow(new Date(item.lastViewedAt), { addSuffix: true })}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatPill({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: color + '22' }]}>
      <Text style={[styles.pillValue, { color }]}>{value}<Text style={styles.pillMax}>/{max}</Text></Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  overallCard: { backgroundColor: '#1E1E2E', borderRadius: 20, padding: 20, gap: 12, alignItems: 'center' },
  overallPercent: { color: '#6C63FF', fontSize: 64, fontWeight: '900' },
  overallLabel: { color: '#9E9EB8', fontSize: 15 },
  progressBarBg: { width: '100%', height: 8, backgroundColor: '#2A2A4A', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#6C63FF', borderRadius: 4 },
  statsRow: { flexDirection: 'row', gap: 12, width: '100%', justifyContent: 'center' },
  pill: { borderRadius: 12, padding: 12, alignItems: 'center', minWidth: 100 },
  pillValue: { fontSize: 20, fontWeight: '800' },
  pillMax: { fontSize: 14, fontWeight: '400' },
  pillLabel: { color: '#9E9EB8', fontSize: 12, marginTop: 2 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  categoryCard: { backgroundColor: '#1E1E2E', borderRadius: 14, padding: 14, gap: 8 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryName: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  categoryPercent: { color: '#6C63FF', fontWeight: '700' },
  categoryBarBg: { height: 6, backgroundColor: '#2A2A4A', borderRadius: 3, overflow: 'hidden' },
  categoryBarFill: { height: '100%', backgroundColor: '#6C63FF', borderRadius: 3 },
  categoryCount: { color: '#9E9EB8', fontSize: 12 },
  activityItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6C63FF' },
  activityInfo: { flex: 1 },
  activityName: { color: '#FFFFFF', fontSize: 14 },
  activityTime: { color: '#9E9EB8', fontSize: 12 },
});
```
