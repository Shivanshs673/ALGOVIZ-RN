# Home Screen + App Navigation + Shared Components
**Files:**
- `app/(tabs)/_layout.tsx`
- `app/(tabs)/home.tsx`
- `src/shared/components/Avatar.tsx`
- `src/shared/components/AlgorithmCard.tsx`
- `src/shared/components/SearchBar.tsx`
- `src/shared/components/EmptyState.tsx`
- `app/(tabs)/algorithms.tsx` ← full algorithm list

---

## Tab Layout — app/(tabs)/_layout.tsx

```tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet } from 'react-native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface Tab { name: string; title: string; icon: IconName; activeIcon: IconName }

const TABS: Tab[] = [
  { name: 'home',         title: 'Home',        icon: 'home-outline',         activeIcon: 'home' },
  { name: 'algorithms',   title: 'Algorithms',  icon: 'code-slash-outline',   activeIcon: 'code-slash' },
  { name: 'study-rooms',  title: 'Rooms',       icon: 'people-outline',       activeIcon: 'people' },
  { name: 'learn',        title: 'Learn',       icon: 'book-outline',         activeIcon: 'book' },
  { name: 'profile',      title: 'Profile',     icon: 'person-outline',       activeIcon: 'person' },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#6B6B8A',
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />
          ) : null,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? tab.activeIcon : tab.icon} size={24} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#1E1E2E',
    borderTopColor: '#2A2A4A',
    borderTopWidth: 0.5,
    paddingTop: 6,
    height: Platform.OS === 'ios' ? 84 : 64,
  },
  tabLabel: { fontSize: 11, fontWeight: '500' },
});
```

---

## Home Screen — app/(tabs)/home.tsx

```tsx
import React, { useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { useProgress } from '../../src/features/progress/hooks/useProgress';
import { ALGORITHMS } from '../../src/features/algorithms/data/algorithmRegistry';
import { AlgorithmCard } from '../../src/shared/components/AlgorithmCard';
import { Algorithm, AlgorithmCategory } from '../../src/types/algorithm.types';

const CATEGORIES: { id: AlgorithmCategory | 'ALL'; label: string; icon: string; color: string }[] = [
  { id: 'SORTING',             label: 'Sorting',   icon: '📊', color: '#6C63FF' },
  { id: 'SEARCHING',           label: 'Searching', icon: '🔍', color: '#FF6584' },
  { id: 'GRAPH',               label: 'Graphs',    icon: '🕸️', color: '#43C59E' },
  { id: 'TREE',                label: 'Trees',     icon: '🌲', color: '#FFB347' },
  { id: 'DYNAMIC_PROGRAMMING', label: 'DP',        icon: '🧩', color: '#A78BFA' },
  { id: 'GREEDY',              label: 'Greedy',    icon: '💰', color: '#34D399' },
  { id: 'BACKTRACKING',        label: 'Backtrack', icon: '↩️', color: '#F87171' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { summary } = useProgress();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Recent algorithms (from progress)
  const recentAlgos = summary.recentActivity
    .slice(0, 5)
    .map(a => ALGORITHMS.find(al => al.id === a.algorithmId))
    .filter(Boolean) as Algorithm[];

  // Featured: pick 3 popular ones if no recent activity
  const featuredAlgos = recentAlgos.length > 0 ? recentAlgos : ALGORITHMS.slice(0, 5);

  const userName = user?.user_metadata?.name?.split(' ')[0] ?? 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={styles.screen}>
      <Animated.ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}, {userName} 👋</Text>
            <Text style={styles.subGreeting}>Ready to learn some algorithms?</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.avatarBtn}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{userName[0].toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Progress card */}
        <TouchableOpacity style={styles.progressCard} onPress={() => router.push('/(tabs)/progress')}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <Text style={styles.progressSubtitle}>{summary.totalViewed} of {summary.totalAlgorithms} algorithms explored</Text>
          </View>
          <View style={styles.progressCircleContainer}>
            <Text style={styles.progressPercent}>{summary.overallPercent}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${summary.overallPercent}%` }]} />
          </View>
          <Text style={styles.progressCta}>View full progress →</Text>
        </TouchableOpacity>

        {/* Category quick access */}
        <Text style={styles.sectionTitle}>Browse by Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, { backgroundColor: cat.color + '22' }]}
              onPress={() => router.push({ pathname: '/(tabs)/algorithms', params: { category: cat.id } })}
            >
              <Text style={styles.categoryEmoji}>{cat.icon}</Text>
              <Text style={[styles.categoryLabel, { color: cat.color }]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured / Recent */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{recentAlgos.length > 0 ? 'Recently Viewed' : 'Start Here'}</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/algorithms')}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>
        {featuredAlgos.map(algo => (
          <AlgorithmCard
            key={algo.id}
            algorithm={algo}
            onPress={() => router.push(`/algorithm/${algo.id}`)}
          />
        ))}

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <QuickActionCard icon="🎲" title="Random Algorithm" subtitle="Surprise me!" color="#6C63FF"
            onPress={() => {
              const random = ALGORITHMS[Math.floor(Math.random() * ALGORITHMS.length)];
              router.push(`/algorithm/${random.id}`);
            }}
          />
          <QuickActionCard icon="🚪" title="Study Rooms" subtitle="Learn with others" color="#43C59E"
            onPress={() => router.push('/(tabs)/study-rooms')}
          />
          <QuickActionCard icon="📖" title="Learn Concepts" subtitle="Theory & patterns" color="#FFB347"
            onPress={() => router.push('/(tabs)/learn')}
          />
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

function QuickActionCard({ icon, title, subtitle, color, onPress }: {
  icon: string; title: string; subtitle: string; color: string; onPress: () => void
}) {
  return (
    <TouchableOpacity style={[styles.qaCard, { borderLeftColor: color, borderLeftWidth: 4 }]} onPress={onPress}>
      <Text style={styles.qaIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.qaTitle}>{title}</Text>
        <Text style={styles.qaSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#6B6B8A" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 16, gap: 16, paddingBottom: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  subGreeting: { color: '#9E9EB8', fontSize: 14, marginTop: 2 },
  avatarBtn: {},
  avatarPlaceholder: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#6C63FF', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  progressCard: { backgroundColor: '#1E1E2E', borderRadius: 20, padding: 16, gap: 8 },
  progressInfo: {},
  progressTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  progressSubtitle: { color: '#9E9EB8', fontSize: 13 },
  progressCircleContainer: { position: 'absolute', top: 16, right: 16, width: 52, height: 52, borderRadius: 26, backgroundColor: '#6C63FF22', alignItems: 'center', justifyContent: 'center' },
  progressPercent: { color: '#6C63FF', fontSize: 16, fontWeight: '900' },
  progressBarBg: { height: 6, backgroundColor: '#2A2A4A', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#6C63FF', borderRadius: 3 },
  progressCta: { color: '#6C63FF', fontSize: 13, fontWeight: '600' },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { color: '#6C63FF', fontSize: 13 },
  categoryScroll: { gap: 10, paddingBottom: 4 },
  categoryChip: { borderRadius: 14, padding: 12, alignItems: 'center', gap: 6, minWidth: 72 },
  categoryEmoji: { fontSize: 22 },
  categoryLabel: { fontSize: 11, fontWeight: '600' },
  quickActions: { gap: 10 },
  qaCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1E1E2E', borderRadius: 14, padding: 14 },
  qaIcon: { fontSize: 24 },
  qaTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  qaSubtitle: { color: '#9E9EB8', fontSize: 12 },
});
```

---

## Algorithm List Screen — app/(tabs)/algorithms.tsx

```tsx
import React, { useState, useMemo } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ALGORITHMS, ALGORITHMS_PER_CATEGORY } from '../../src/features/algorithms/data/algorithmRegistry';
import { AlgorithmCard } from '../../src/shared/components/AlgorithmCard';
import { Algorithm, AlgorithmCategory } from '../../src/types/algorithm.types';

const CATEGORIES = ['ALL', 'SORTING', 'SEARCHING', 'GRAPH', 'TREE', 'DYNAMIC_PROGRAMMING', 'GREEDY', 'BACKTRACKING', 'STRING'];

export default function AlgorithmsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(params.category ?? 'ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');

  const filtered = useMemo(() => {
    let list = ALGORITHMS;
    if (selectedCategory !== 'ALL') list = list.filter(a => a.category === selectedCategory);
    if (selectedDifficulty !== 'ALL') list = list.filter(a => a.difficulty === selectedDifficulty);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some(t => t.includes(q))
      );
    }
    return list;
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Algorithms</Text>
        <Text style={styles.headerCount}>{filtered.length} available</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#6B6B8A" />
        <TextInput style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} placeholder="Search algorithms..." placeholderTextColor="#6B6B8A" />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={18} color="#6B6B8A" /></TouchableOpacity>
        )}
      </View>

      {/* Category filter */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedCategory(item)}
            style={[styles.filterChip, item === selectedCategory && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, item === selectedCategory && styles.filterChipTextActive]}>
              {item === 'ALL' ? `All (${ALGORITHMS.length})` : `${item.replace(/_/g, ' ')} (${ALGORITHMS_PER_CATEGORY[item as AlgorithmCategory] ?? 0})`}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Difficulty filter */}
      <View style={styles.diffRow}>
        {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(d => (
          <TouchableOpacity key={d} onPress={() => setSelectedDifficulty(d)}
            style={[styles.diffChip, d === selectedDifficulty && styles.diffChipActive]}>
            <Text style={[styles.diffChipText, d === selectedDifficulty && styles.diffChipTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Algorithm list */}
      <FlatList
        data={filtered}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <AlgorithmCard algorithm={item} onPress={() => router.push(`/algorithm/${item.id}`)} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No algorithms found</Text>
            <Text style={styles.emptySubtitle}>Try a different search or filter</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingBottom: 8 },
  headerTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  headerCount: { color: '#9E9EB8', fontSize: 14 },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, backgroundColor: '#1E1E2E', borderRadius: 12, paddingHorizontal: 12, gap: 8, marginBottom: 8 },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 15, paddingVertical: 12 },
  filterRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  filterChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#1E1E2E' },
  filterChipActive: { backgroundColor: '#6C63FF' },
  filterChipText: { color: '#9E9EB8', fontSize: 12 },
  filterChipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  diffRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  diffChip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#1E1E2E' },
  diffChipActive: { backgroundColor: '#2A2A4A' },
  diffChipText: { color: '#6B6B8A', fontSize: 11 },
  diffChipTextActive: { color: '#FFFFFF', fontWeight: '600' },
  listContent: { padding: 16, gap: 10, paddingTop: 8 },
  emptyState: { alignItems: 'center', gap: 8, marginTop: 60 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  emptySubtitle: { color: '#9E9EB8', fontSize: 14 },
});
```

---

## AlgorithmCard.tsx

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Algorithm } from '../../types/algorithm.types';
import { Ionicons } from '@expo/vector-icons';

const CATEGORY_COLORS: Record<string, string> = {
  SORTING: '#6C63FF', SEARCHING: '#FF6584', GRAPH: '#43C59E', TREE: '#FFB347',
  DYNAMIC_PROGRAMMING: '#A78BFA', GREEDY: '#34D399', BACKTRACKING: '#F87171', STRING: '#60A5FA',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: '#43C59E', INTERMEDIATE: '#FFB347', ADVANCED: '#FF4757',
};

interface AlgorithmCardProps {
  algorithm: Algorithm;
  onPress: () => void;
  compact?: boolean;
}

export function AlgorithmCard({ algorithm: algo, onPress, compact }: AlgorithmCardProps) {
  const catColor = CATEGORY_COLORS[algo.category] ?? '#6C63FF';
  const diffColor = DIFFICULTY_COLORS[algo.difficulty];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.leftAccent, { backgroundColor: catColor }]} />
      <View style={styles.body}>
        {/* Top row */}
        <View style={styles.topRow}>
          <Text style={styles.name}>{algo.name}</Text>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: diffColor + '22' }]}>
              <Text style={[styles.badgeText, { color: diffColor }]}>{algo.difficulty}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: catColor + '22' }]}>
              <Text style={[styles.badgeText, { color: catColor }]}>{algo.category.replace(/_/g, ' ')}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {!compact && (
          <Text style={styles.description} numberOfLines={2}>{algo.description}</Text>
        )}

        {/* Complexity pills */}
        <View style={styles.complexityRow}>
          <ComplexityPill label="Best"  value={algo.timeComplexity.best}   />
          <ComplexityPill label="Avg"   value={algo.timeComplexity.average} />
          <ComplexityPill label="Worst" value={algo.timeComplexity.worst}   />
          <ComplexityPill label="Space" value={algo.spaceComplexity}        />
        </View>

        {/* Tags */}
        <View style={styles.tagRow}>
          {algo.tags.slice(0, 3).map(t => (
            <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
          ))}
          <Ionicons name="play-circle" size={20} color={catColor} style={styles.playIcon} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ComplexityPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={styles.pillValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: '#1E1E2E', borderRadius: 16, overflow: 'hidden' },
  leftAccent: { width: 4 },
  body: { flex: 1, padding: 14, gap: 8 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  name: { flex: 1, color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  badges: { flexDirection: 'row', gap: 4, flexShrink: 0 },
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  description: { color: '#9E9EB8', fontSize: 13, lineHeight: 18 },
  complexityRow: { flexDirection: 'row', gap: 6 },
  pill: { backgroundColor: '#2A2A4A', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, alignItems: 'center' },
  pillLabel: { color: '#6B6B8A', fontSize: 9 },
  pillValue: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  tag: { backgroundColor: '#2A2A4A', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { color: '#6B6B8A', fontSize: 11 },
  playIcon: { marginLeft: 'auto' },
});
```

---

## Avatar.tsx

```tsx
import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  style?: ViewStyle;
}

// Color palette based on name
const PALETTE = ['#6C63FF', '#FF6584', '#43C59E', '#FFB347', '#A78BFA', '#F87171', '#34D399', '#60A5FA'];
function nameToColor(name: string): string {
  let hash = 0;
  for (const c of name) hash = hash * 31 + c.charCodeAt(0);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function Avatar({ name, avatarUrl, size = 40, style }: AvatarProps) {
  const initials = name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  const color = nameToColor(name);

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
      />
    );
  }

  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Text style={{ color: '#FFFFFF', fontSize: size * 0.38, fontWeight: '700' }}>{initials}</Text>
    </View>
  );
}
```
