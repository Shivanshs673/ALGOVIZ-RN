// src/screens/AlgorithmsScreen.tsx
// Fixed: added Platform to imports

import React, { useState, useMemo } from 'react';
import { Platform, View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ALGORITHMS, getAllCategories } from '../features/algorithms/data/algorithmRegistry';
import { Algorithm } from '../types/algorithm.types';
import { Ionicons } from '@expo/vector-icons';

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: '#43C59E',
  INTERMEDIATE: '#FFB347',
  ADVANCED: '#FF4757',
};

export function AlgorithmsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(params.category ?? 'ALL');

  const categories = useMemo(() => ['ALL', ...getAllCategories()], []);

  const filteredAlgorithms = useMemo(() => {
    let list = ALGORITHMS;
    if (selectedCategory !== 'ALL') {
      list = list.filter((a) => a.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.tags.some((t) => t.includes(q))
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  function renderAlgorithmCard({ item }: { item: Algorithm }) {
    const color = DIFFICULTY_COLORS[item.difficulty] ?? '#6C63FF';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/algorithm/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardName}>{item.name}</Text>
          <View style={[styles.diffBadge, { backgroundColor: color + '22' }]}>
            <Text style={[styles.diffText, { color }]}>{item.difficulty}</Text>
          </View>
        </View>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.tagRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category.replace(/_/g, ' ')}</Text>
          </View>
          {item.tags.slice(0, 2).map((tag) => (
            <View key={tag} style={styles.tagBadge}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Algorithms</Text>
        <Text style={styles.subtitle}>Explore and visualize algorithms step-by-step</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#6B6B8A" />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search algorithms or tags..."
          placeholderTextColor="#6B6B8A"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close" size={18} color="#9E9EB8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories chips */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item)}
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
              >
                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                  {item === 'ALL' ? 'All' : item.replace(/_/g, ' ')}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Algorithm list */}
      <FlatList
        data={filteredAlgorithms}
        keyExtractor={(item) => item.id}
        renderItem={renderAlgorithmCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No algorithms match your query</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#9E9EB8', fontSize: 14, marginTop: 4 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E2E',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    gap: 8,
  },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 15 },
  categoriesWrapper: { marginBottom: 12 },
  categoriesList: { paddingHorizontal: 16, gap: 8 },
  categoryChip: {
    backgroundColor: '#1E1E2E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryChipActive: { backgroundColor: '#6C63FF' },
  categoryText: { color: '#9E9EB8', fontSize: 13, fontWeight: '600' },
  categoryTextActive: { color: '#FFFFFF' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  card: { backgroundColor: '#1E1E2E', borderRadius: 16, padding: 16, gap: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', flex: 1, marginRight: 8 },
  diffBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  diffText: { fontSize: 10, fontWeight: '700' },
  cardDesc: { color: '#9E9EB8', fontSize: 13, lineHeight: 18 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  categoryBadge: { backgroundColor: '#2A2A4A', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  categoryBadgeText: { color: '#6C63FF', fontSize: 10, fontWeight: '700' },
  tagBadge: { backgroundColor: '#121212', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  tagText: { color: '#6B6B8A', fontSize: 10 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#6B6B8A', fontSize: 15 },
});