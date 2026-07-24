import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { profileSummary } from '../data/mockData';
import { ScreenCard } from '../components/ScreenCard';
import { useAppState } from '../state/AppStateProvider';
export function ProfileScreen() {
  const router = useRouter();
  const { session, signOut } = useAppState();

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenCard title="Profile" subtitle="Local-first identity and onboarding state.">
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profileSummary.name.slice(0, 1)}</Text>
        </View>
        <Text style={styles.name}>{session.user?.name ?? profileSummary.name}</Text>
        <Text style={styles.username}>@{session.user?.username ?? profileSummary.username}</Text>
        <Text style={styles.email}>{session.user?.email ?? profileSummary.email}</Text>

        <View style={styles.completionCard}>
          <Text style={styles.completionLabel}>Profile completion</Text>
          <Text style={styles.completionValue}>{profileSummary.completion}%</Text>
        </View>

        <View style={styles.actionRow}>
          <Pressable style={styles.primaryAction} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.primaryActionText}>Open auth flow</Text>
          </Pressable>
          <Pressable style={styles.secondaryAction} onPress={() => router.push('/(tabs)/progress')}>
            <Text style={styles.secondaryActionText}>Check progress</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryAction}
            onPress={async () => {
              await signOut();
              router.replace('/(auth)/login');
            }}
          >
            <Text style={styles.secondaryActionText}>Sign out</Text>
          </Pressable>
        </View>
      </ScreenCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#78d7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#081120',
    fontSize: 28,
    fontWeight: '900',
  },
  name: {
    color: '#f6f9ff',
    fontSize: 24,
    fontWeight: '800',
  },
  username: {
    color: '#78d7ff',
    fontWeight: '700',
  },
  email: {
    color: '#9baecc',
  },
  completionCard: {
    backgroundColor: '#101a2f',
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  completionLabel: {
    color: '#95a8c6',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  completionValue: {
    color: '#f6f9ff',
    fontSize: 22,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  primaryAction: {
    backgroundColor: '#78d7ff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  primaryActionText: {
    color: '#081120',
    fontWeight: '800',
  },
  secondaryAction: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  secondaryActionText: {
    color: '#edf3ff',
    fontWeight: '700',
  },
});