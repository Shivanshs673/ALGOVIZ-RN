// app/(tabs)/profile.tsx
// Updated to use ERD-aligned UserProfile (no bio/skillLevel — uses name, username, email, phoneNo)

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '../../src/features/profile/hooks/useProfile';
import { useProgress } from '../../src/features/profile/hooks/useProgress';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { deleteUserAccount } from '../../src/features/profile/api/accountApi';
import { isSupabaseConfigured } from '../../src/lib/supabase/client';
import { LEGAL } from '../../src/constants/legal';
import { Avatar } from '../../src/shared/components/Avatar';
import { UpdateProfileInput } from '../../src/types/user.types';
import { Ionicons } from '@expo/vector-icons';

// Avatar accent colors matching ERD avatar_color_index
const AVATAR_COLORS = ['#6C63FF', '#43C59E', '#FFB347', '#FF6584', '#00C9FF', '#F7971E', '#FF4757', '#2ECC71'];

export default function ProfileScreen() {
  const {
    profile,
    isLoading,
    isEditing,
    setIsEditing,
    uploadAvatar,
    uploadingAvatar,
    updateProfile,
    isUpdating,
  } = useProfile();
  const { summary } = useProgress();
  const { signOut } = useAuthStore();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [deleting, setDeleting] = useState(false);

  function startEditing() {
    if (!profile) return;
    setName(profile.name);
    setUsername(profile.username);
    setPhoneNo(profile.phoneNo ?? '');
    setIsEditing(true);
  }

  async function saveProfile() {
    const input: UpdateProfileInput = { name, username, phoneNo };
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
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      try {
        await uploadAvatar(asset.uri, asset.mimeType);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        Alert.alert(
          'Upload failed',
          msg,
          [{ text: 'OK' }],
        );
      }
    }
  }

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  }

  async function handleDeleteAccount() {
    if (!profile || !isSupabaseConfigured) {
      Alert.alert('Unavailable', 'Account deletion requires a connected Supabase backend.');
      return;
    }

    Alert.alert(
      'Delete Account',
      'This permanently removes your profile, progress, and room memberships. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteUserAccount(profile.userId);
              Alert.alert('Account deleted', 'Your account and data have been removed.');
            } catch (e: unknown) {
              const msg = e instanceof Error ? e.message : 'Could not delete account';
              Alert.alert('Deletion issue', msg);
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  }

  function openUrl(url: string) {
    Linking.openURL(url).catch(() => {
      Alert.alert('Could not open link', url);
    });
  }

  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Could not load profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  const accentColor = AVATAR_COLORS[profile.avatarColorIndex % AVATAR_COLORS.length] ?? '#6C63FF';

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickAvatar} disabled={uploadingAvatar} style={styles.avatarWrapper}>
            <Avatar name={profile.name} avatarUrl={profile.avatarUrl} size={96} />
            <View style={[styles.avatarEditBadge, { backgroundColor: accentColor }]}>
              <Ionicons name={uploadingAvatar ? 'reload' : 'camera'} size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          {uploadingAvatar && <Text style={styles.uploadingText}>Uploading...</Text>}
        </View>

        {/* Profile card */}
        <View style={styles.card}>
          {!isEditing ? (
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
              {profile.phoneNo ? <Text style={styles.phone}>{profile.phoneNo}</Text> : null}
              <View style={[styles.accentBadge, { backgroundColor: accentColor + '22' }]}>
                <Text style={[styles.accentBadgeText, { color: accentColor }]}>Member</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.editTitle}>Edit Profile</Text>
              <InputField label="Display Name" value={name} onChange={setName} placeholder="Your name" />
              <InputField label="Username" value={username} onChange={setUsername} placeholder="@username" autoCapitalize="none" />
              <Text style={styles.readOnlyLabel}>Email</Text>
              <Text style={styles.readOnlyValue}>{profile.email}</Text>
              <InputField label="Phone" value={phoneNo} onChange={setPhoneNo} placeholder="+1 234 567 8900" keyboardType="phone-pad" />

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

        {/* Progress stats */}
        <View style={styles.statsRow}>
          <StatCard label={'Algorithms\nViewed'} value={String(summary.totalViewed)} color="#6C63FF" />
          <StatCard label={'Algorithms\nCompleted'} value={String(summary.totalCompleted)} color="#43C59E" />
          <StatCard label={'Overall\nProgress'} value={`${summary.overallPercent}%`} color="#FFB347" />
        </View>

        {/* Legal & account */}
        <View style={styles.legalCard}>
          <Text style={styles.legalTitle}>Legal & Support</Text>
          <TouchableOpacity style={styles.legalRow} onPress={() => openUrl(LEGAL.privacyPolicyUrl)}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#6C63FF" />
            <Text style={styles.legalText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalRow} onPress={() => openUrl(LEGAL.termsOfServiceUrl)}>
            <Ionicons name="document-text-outline" size={18} color="#6C63FF" />
            <Text style={styles.legalText}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalRow} onPress={() => openUrl(`mailto:${LEGAL.supportEmail}`)}>
            <Ionicons name="mail-outline" size={18} color="#6C63FF" />
            <Text style={styles.legalText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleDeleteAccount} disabled={deleting} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color="#FF4757" />
          <Text style={styles.deleteText}>{deleting ? 'Deleting...' : 'Delete Account'}</Text>
        </TouchableOpacity>

        {/* Sign out */}
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
          <Ionicons name="log-out-outline" size={20} color="#FF4757" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function InputField({
  label, value, onChange, placeholder, multiline, autoCapitalize, keyboardType,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences';
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && styles.fieldTextArea]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#6B6B8A"
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        keyboardType={keyboardType ?? 'default'}
        autoCorrect={false}
      />
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#9E9EB8' },
  avatarSection: { alignItems: 'center', gap: 8 },
  avatarWrapper: { position: 'relative' },
  avatarEditBadge: {
    position: 'absolute', bottom: 0, right: 0, borderRadius: 20,
    width: 30, height: 30, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#121212',
  },
  uploadingText: { color: '#9E9EB8', fontSize: 12 },
  card: { backgroundColor: '#1E1E2E', borderRadius: 20, padding: 20, gap: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileName: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#2A2A4A', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
  },
  editBtnText: { color: '#6C63FF', fontWeight: '600' },
  username: { color: '#6C63FF', fontSize: 14 },
  email: { color: '#9E9EB8', fontSize: 13 },
  phone: { color: '#9E9EB8', fontSize: 13 },
  accentBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  accentBadgeText: { fontSize: 12, fontWeight: '700' },
  editTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  fieldGroup: { gap: 6 },
  fieldLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  fieldInput: { backgroundColor: '#2A2A4A', color: '#FFFFFF', borderRadius: 12, padding: 12, fontSize: 15 },
  fieldTextArea: { height: 80, textAlignVertical: 'top' },
  editActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelEditBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: '#2A2A4A' },
  cancelEditText: { color: '#9E9EB8', fontWeight: '600' },
  saveBtn: { flex: 2, borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: '#6C63FF' },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, backgroundColor: '#1E1E2E', borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { color: '#9E9EB8', fontSize: 11, textAlign: 'center', lineHeight: 16 },
  legalCard: { backgroundColor: '#1E1E2E', borderRadius: 20, padding: 16, gap: 10 },
  legalTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  legalRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  legalText: { color: '#9E9EB8', fontSize: 14 },
  readOnlyLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  readOnlyValue: { color: '#9E9EB8', fontSize: 15, paddingVertical: 4 },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#FF475711', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#FF475744',
  },
  deleteText: { color: '#FF4757', fontWeight: '700', fontSize: 15 },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#FF475722', borderRadius: 14, padding: 14,
  },
  signOutText: { color: '#FF4757', fontWeight: '700', fontSize: 15 },
});