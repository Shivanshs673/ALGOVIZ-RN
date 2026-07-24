import React from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useConcepts } from '../../src/features/learn/hooks/useConcepts';
import { Concept, ConceptCategory, CATEGORY_META, CONCEPT_CATEGORIES } from '../../src/features/learn/data/conceptsData';
import { Ionicons } from '@expo/vector-icons';

type FilterCategory = ConceptCategory | 'ALL';

export default function LearnScreen() {
  const router = useRouter();
  const { concepts, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useConcepts();

  function renderConceptCard({ item }: { item: Concept }) {
    const catMeta = CATEGORY_META[item.category];
    const diffColor = item.difficulty === 'BEGINNER' ? '#43C59E' : item.difficulty === 'INTERMEDIATE' ? '#FFB347' : '#FF4757';

    return (
      <TouchableOpacity style={styles.card} onPress={() => router.push(`/concept/${item.id}`)} activeOpacity={0.85}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: catMeta.color + '22' }]}>
            <Text style={styles.iconEmoji}>{item.icon}</Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.categoryBadge, { backgroundColor: catMeta.color + '22' }]}>
                <Text style={[styles.badgeText, { color: catMeta.color }]}>{catMeta.label}</Text>
              </View>
              <View style={[styles.diffBadge, { backgroundColor: diffColor + '22' }]}>
                <Text style={[styles.badgeText, { color: diffColor }]}>{item.difficulty}</Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6B6B8A" />
        </View>
        <Text style={styles.cardSummary} numberOfLines={2}>{item.summary}</Text>
        <View style={styles.tagRow}>
          {item.tags.slice(0, 3).map((t) => (
            <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
          ))}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learn Concepts</Text>
        <Text style={styles.headerSubtitle}>Master the theory behind algorithms</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#6B6B8A" />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search concepts..."
          placeholderTextColor="#6B6B8A"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close" size={18} color="#9E9EB8" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterWrapper}>
        <FlatList
          horizontal
          data={['ALL', ...CONCEPT_CATEGORIES]}
          keyExtractor={(i) => i}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item: cat }) => {
            const typed = cat as FilterCategory;
            const meta = typed === 'ALL' ? { label: 'All', color: '#6C63FF' } : CATEGORY_META[typed];
            const isSelected = selectedCategory === typed;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(typed)}
                style={[styles.filterChip, isSelected && { backgroundColor: meta.color }]}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {cat === 'ALL' ? 'All' : meta.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={concepts}
        keyExtractor={(c) => c.id}
        renderItem={renderConceptCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No concepts found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  header: { padding: 16, paddingBottom: 8 },
  headerTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  headerSubtitle: { color: '#9E9EB8', fontSize: 14, marginTop: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, backgroundColor: '#1E1E2E', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 15 },
  filterWrapper: { marginBottom: 12 },
  filterList: { paddingHorizontal: 16, gap: 8 },
  filterChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#1E1E2E' },
  filterChipText: { color: '#9E9EB8', fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: '#FFFFFF' },
  listContent: { padding: 16, paddingTop: 4, gap: 12 },
  card: { backgroundColor: '#1E1E2E', borderRadius: 16, padding: 16, gap: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconEmoji: { fontSize: 24 },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', gap: 6 },
  categoryBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  diffBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  cardSummary: { color: '#9E9EB8', fontSize: 13, lineHeight: 19 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#2A2A4A', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { color: '#6B6B8A', fontSize: 11 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#6B6B8A', fontSize: 15 },
});