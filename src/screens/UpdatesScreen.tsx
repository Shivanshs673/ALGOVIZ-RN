import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { updateStatus } from '../data/mockData';
import { ScreenCard } from '../components/ScreenCard';

export function UpdatesScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenCard title="App updates" subtitle="GitHub primary with Supabase fallback in the product design.">
        <Text style={styles.versionText}>Latest: {updateStatus.versionName} ({updateStatus.versionCode})</Text>
        <Text style={styles.noteCopy}>{updateStatus.releaseNotes}</Text>

        <View style={styles.infoRow}>
          <InfoTile label="Source" value={updateStatus.source} />
          <InfoTile label="Force update" value={updateStatus.forceUpdate ? 'Yes' : 'No'} />
        </View>

        <Pressable style={styles.primaryAction}>
          <Text style={styles.primaryActionText}>Check now</Text>
        </Pressable>
      </ScreenCard>
    </ScrollView>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoTile}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  versionText: {
    color: '#f6f9ff',
    fontSize: 18,
    fontWeight: '800',
  },
  noteCopy: {
    color: '#9baecc',
    fontSize: 13,
    lineHeight: 19,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  infoTile: {
    flex: 1,
    minWidth: 130,
    backgroundColor: '#101a2f',
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  infoLabel: {
    color: '#95a8c6',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 11,
    fontWeight: '700',
  },
  infoValue: {
    color: '#f6f9ff',
    fontWeight: '800',
    fontSize: 15,
  },
  primaryAction: {
    backgroundColor: '#78d7ff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#081120',
    fontWeight: '800',
  },
});