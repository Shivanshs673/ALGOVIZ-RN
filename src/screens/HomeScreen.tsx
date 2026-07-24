import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../features/auth/store/authStore';
import { useProgress } from '../features/progress/hooks/useProgress';
import { ScreenCard } from '../components/ScreenCard';
import { Avatar } from '../shared/components/Avatar';
import { ALGORITHMS } from '../features/algorithms/data/algorithmRegistry';
import { CONCEPTS } from '../features/learn/data/conceptsData';
import { Ionicons } from '@expo/vector-icons';

const THEORY_CARDS = [
  {
    id: 'big-o',
    title: 'Big-O Complexity',
    icon: '📊',
    color: '#6C63FF',
    route: '/concept/big-o',
    blurb: 'Measure how runtime & memory scale as input grows.',
  },
  {
    id: 'arrays',
    title: 'Arrays & Memory',
    icon: '📦',
    color: '#43C59E',
    route: '/concept/arrays',
    blurb: 'Contiguous storage, O(1) access, two-pointer patterns.',
  },
  {
    id: 'trees',
    title: 'Trees & BSTs',
    icon: '🌳',
    color: '#FF6584',
    route: '/concept/binary-trees',
    blurb: 'Hierarchical data — traversals, BST operations.',
  },
  {
    id: 'graphs',
    title: 'Graph Theory',
    icon: '🕸️',
    color: '#FFB347',
    route: '/concept/graphs',
    blurb: 'BFS, DFS, shortest paths, topological order.',
  },
];

const CORE_FEATURES = [
  {
    title: 'Step-by-Step Visualizer',
    desc: 'Play, pause, scrub, and set speed. Custom array & search inputs.',
    icon: 'play-circle' as const,
    color: '#6C63FF',
    route: '/(tabs)/algorithms',
  },
  {
    title: 'Study Rooms',
    desc: 'Chat with peers while solving problems together.',
    icon: 'people' as const,
    color: '#43C59E',
    route: '/(tabs)/study-rooms',
  },
  {
    title: 'Theory Library',
    desc: `${CONCEPTS.length}+ concept cards from basics to interview prep.`,
    icon: 'library' as const,
    color: '#FFB347',
    route: '/(tabs)/learn',
  },
  {
    title: 'Progress Dashboard',
    desc: 'Track viewed & completed algorithms across categories.',
    icon: 'stats-chart' as const,
    color: '#FF6584',
    route: '/(tabs)/progress',
  },
];

export function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { summary } = useProgress();

  const userDisplayName =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Learner';

  const quickLinks = [
    { label: 'Sorting', icon: 'swap-horizontal', category: 'SORTING', color: '#6C63FF' },
    { label: 'Searching', icon: 'search', category: 'SEARCHING', color: '#43C59E' },
    { label: 'Graphs', icon: 'git-network-outline', category: 'GRAPH', color: '#FFB347' },
    { label: 'DP', icon: 'grid', category: 'DYNAMIC_PROGRAMMING', color: '#A78BFA' },
    { label: 'Strings', icon: 'text', category: 'STRING', color: '#00C9FF' },
    { label: 'Trie', icon: 'git-branch', category: 'TRIE', color: '#F7971E' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heroCard}>
        <View style={styles.profileHeader}>
          <Avatar name={userDisplayName} size={52} />
          <View style={styles.profileText}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{userDisplayName}</Text>
          </View>
          <Pressable style={styles.progressPill} onPress={() => router.push('/(tabs)/progress')}>
            <Text style={styles.progressPct}>{summary.overallPercent}%</Text>
            <Text style={styles.progressLbl}>done</Text>
          </Pressable>
        </View>

        <Text style={styles.heroTitle}>Learn Algorithms Visually</Text>
        <Text style={styles.heroCopy}>
          {ALGORITHMS.length} interactive visualizations, theory cards, and collaborative study rooms —
          from bubble sort to KMP & trie structures.
        </Text>

        <View style={styles.actionRow}>
          <Pressable style={styles.primaryAction} onPress={() => router.push('/(tabs)/algorithms')}>
            <Ionicons name="code-slash" size={18} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Explore Algorithms</Text>
          </Pressable>
          <Pressable style={styles.secondaryAction} onPress={() => router.push('/(tabs)/learn')}>
            <Ionicons name="book-outline" size={18} color="#FFFFFF" />
            <Text style={styles.secondaryActionText}>Theory</Text>
          </Pressable>
        </View>
      </View>

      <ScreenCard title="CS Theory" subtitle="Tap a card to read the full lesson">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.theoryRow}>
          {THEORY_CARDS.map((t) => (
            <Pressable
              key={t.id}
              style={[styles.theoryCard, { borderTopColor: t.color }]}
              onPress={() => router.push(t.route as any)}
            >
              <Text style={styles.theoryEmoji}>{t.icon}</Text>
              <Text style={styles.theoryTitle}>{t.title}</Text>
              <Text style={styles.theoryBlurb} numberOfLines={2}>{t.blurb}</Text>
              <Text style={[styles.theoryLink, { color: t.color }]}>Read →</Text>
            </Pressable>
          ))}
        </ScrollView>
      </ScreenCard>

      <ScreenCard title="Quick Start" subtitle="Jump into a category">
        <View style={styles.quickGrid}>
          {quickLinks.map((link) => (
            <Pressable
              key={link.label}
              style={[styles.quickCard, { borderLeftColor: link.color }]}
              onPress={() =>
                router.push({ pathname: '/(tabs)/algorithms', params: { category: link.category } })
              }
            >
              <Ionicons name={link.icon as any} size={22} color={link.color} />
              <Text style={styles.quickLabel}>{link.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScreenCard>

      <ScreenCard title="Core Features" subtitle="Everything AlgoViz+ offers">
        {CORE_FEATURES.map((item) => (
          <Pressable
            key={item.title}
            style={styles.featureRow}
            onPress={() => router.push(item.route as any)}
          >
            <View style={[styles.featureIcon, { backgroundColor: item.color + '22' }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <View style={styles.featureBody}>
              <Text style={styles.featureTitle}>{item.title}</Text>
              <Text style={styles.featureDesc}>{item.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6B6B8A" />
          </Pressable>
        ))}
      </ScreenCard>

      <View style={styles.tipCard}>
        <Text style={styles.tipLabel}>💡 Daily Tip</Text>
        <Text style={styles.tipText}>
          When stuck on a problem, ask: can a hash map turn O(n²) into O(n)? Can sorting enable two pointers?
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, backgroundColor: '#121212' },
  heroCard: {
    backgroundColor: '#1E1E2E', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: '#2A2A4A', gap: 14,
  },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileText: { flex: 1 },
  welcomeText: { color: '#9E9EB8', fontSize: 12 },
  userName: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  progressPill: {
    alignItems: 'center', backgroundColor: '#6C63FF22', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#6C63FF44',
  },
  progressPct: { color: '#6C63FF', fontSize: 16, fontWeight: '800' },
  progressLbl: { color: '#9E9EB8', fontSize: 10 },
  heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', lineHeight: 30 },
  heroCopy: { color: '#9E9EB8', fontSize: 14, lineHeight: 20 },
  actionRow: { flexDirection: 'row', gap: 10 },
  primaryAction: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#6C63FF', borderRadius: 14, paddingVertical: 14,
  },
  primaryActionText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  secondaryAction: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#2A2A4A', borderRadius: 14, paddingVertical: 14,
  },
  secondaryActionText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  theoryRow: { gap: 12, paddingVertical: 8 },
  theoryCard: {
    width: 160, backgroundColor: '#1A1A2E', borderRadius: 16, padding: 14, gap: 6,
    borderTopWidth: 3,
  },
  theoryEmoji: { fontSize: 28 },
  theoryTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  theoryBlurb: { color: '#9E9EB8', fontSize: 11, lineHeight: 15 },
  theoryLink: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  quickCard: {
    width: '30%', flexGrow: 1, minWidth: 95, backgroundColor: '#1A1A2E', borderRadius: 14,
    padding: 14, alignItems: 'center', gap: 8, borderLeftWidth: 3,
  },
  quickLabel: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1A1A2E',
    borderRadius: 14, padding: 14, marginTop: 10,
  },
  featureIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  featureBody: { flex: 1, gap: 2 },
  featureTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  featureDesc: { color: '#9E9EB8', fontSize: 12, lineHeight: 16 },
  tipCard: {
    backgroundColor: '#43C59E18', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#43C59E33',
  },
  tipLabel: { color: '#43C59E', fontWeight: '700', marginBottom: 6 },
  tipText: { color: '#C8E6D4', fontSize: 13, lineHeight: 19 },
});
