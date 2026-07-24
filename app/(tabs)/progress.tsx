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
                  <Text style={styles.activityTime}>
                    {formatDistanceToNow(new Date(item.lastViewedAt), { addSuffix: true })}
                  </Text>
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