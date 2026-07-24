import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useProgress } from '../features/profile/hooks/useProgress';
import { ScreenCard } from '../components/ScreenCard';

export function ProgressScreen() {
  const { summary } = useProgress();

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenCard title="Your progress" subtitle="Derived from explored algorithms and categories.">
        <View style={styles.metricRow}>
          <Metric label="Algorithms" value={String(summary.totalAlgorithms)} />
          <Metric label="Viewed" value={String(summary.totalViewed)} />
          <Metric label="Completed" value={String(summary.totalCompleted)} />
        </View>

        <View style={styles.barOuter}>
          <View style={[styles.barInner, { width: `${summary.overallPercent}%` }]} />
        </View>

        <Text style={styles.sectionTitle}>Recent activity</Text>
        <View style={styles.list}>
          {summary.recentActivity.map((activity) => (
            <View key={activity.algorithmId} style={styles.activityRow}>
              <Text style={styles.activityTitle}>{activity.algorithmName}</Text>
              <Text style={styles.activityCopy}>{activity.lastViewedAt}</Text>
            </View>
          ))}
        </View>
      </ScreenCard>
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metric: {
    flex: 1,
    backgroundColor: '#101a2f',
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  metricValue: {
    color: '#f6f9ff',
    fontSize: 22,
    fontWeight: '900',
  },
  metricLabel: {
    color: '#95a8c6',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  barOuter: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  barInner: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#78d7ff',
  },
  sectionTitle: {
    color: '#f6f9ff',
    fontSize: 15,
    fontWeight: '800',
  },
  list: {
    gap: 10,
  },
  activityRow: {
    backgroundColor: '#101a2f',
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  activityTitle: {
    color: '#f6f9ff',
    fontWeight: '800',
  },
  activityCopy: {
    color: '#9baecc',
    fontSize: 12,
  },
});
