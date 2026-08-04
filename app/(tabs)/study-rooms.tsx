// app/(tabs)/study-rooms.tsx
// Improved: proper error handling on createRoom, loading states, error display

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRooms } from '../../src/features/study-rooms/hooks/useRooms';
import { RoomCard } from '../../src/features/study-rooms/components/RoomCard';
import { CreateRoomModal } from '../../src/features/study-rooms/components/CreateRoomModal';
import { Ionicons } from '@expo/vector-icons';
import { CreateRoomInput } from '../../src/types/studyroom.types';

export default function StudyRoomsScreen() {
  const router = useRouter();
  const {
    rooms,
    isLoading,
    error,
    isDemoMode,
    refetch,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    categories,
    createRoom,
    isCreating,
  } = useRooms();
  const [modalVisible, setModalVisible] = useState(false);

  async function handleCreateRoom(input: CreateRoomInput) {
    try {
      const room = await createRoom(input);
      setModalVisible(false);
      // Navigate into the new room immediately
      router.push(`/study-room/${room.id}`);
    } catch (e: any) {
      Alert.alert('Error creating room', e?.message ?? 'Please try again.');
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Study Rooms</Text>
          <Text style={styles.subtitle}>Discuss and solve algorithms with peers</Text>
        </View>
        <TouchableOpacity
          style={[styles.createBtn, isCreating && styles.createBtnDisabled]}
          onPress={() => setModalVisible(true)}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="add" size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#6B6B8A" />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search rooms..."
          placeholderTextColor="#6B6B8A"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close" size={18} color="#9E9EB8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category chips */}
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

      {/* Demo / offline banner */}
      {isDemoMode && (
        <View style={styles.demoBanner}>
          <Ionicons name="information-circle-outline" size={18} color="#FFB347" />
          <Text style={styles.demoText}>
            Demo rooms — run study room SQL in Supabase for live rooms (see docs/08_SUPABASE_SETUP.md)
          </Text>
        </View>
      )}

      {/* Error state */}
      {error ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={48} color="#FF4757" />
          <Text style={styles.errorText}>Failed to load rooms</Text>
          <Text style={styles.errorSub}>{(error as Error)?.message ?? 'Check your connection'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RoomCard room={item} onPress={() => router.push(`/study-room/${item.id}`)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#2A2A4A" />
              <Text style={styles.emptyText}>No active rooms found</Text>
              <Text style={styles.emptySubtext}>Create one to get started!</Text>
            </View>
          }
        />
      )}

      {/* Create Room Modal */}
      <CreateRoomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreateRoom}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerInfo: { flex: 1 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#9E9EB8', fontSize: 14, marginTop: 4 },
  createBtn: {
    backgroundColor: '#6C63FF',
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnDisabled: { opacity: 0.5 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E2E',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 15 },
  categoriesWrapper: { marginBottom: 12 },
  categoriesList: { paddingHorizontal: 16, gap: 8 },
  categoryChip: { backgroundColor: '#1E1E2E', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  categoryChipActive: { backgroundColor: '#6C63FF' },
  categoryText: { color: '#9E9EB8', fontSize: 13, fontWeight: '600' },
  categoryTextActive: { color: '#FFFFFF' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { color: '#FF4757', fontSize: 18, fontWeight: '700' },
  errorSub: { color: '#9E9EB8', fontSize: 13 },
  retryBtn: { marginTop: 8, backgroundColor: '#6C63FF', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#FFFFFF', fontWeight: '700' },
  demoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 10,
    backgroundColor: '#FFB34718', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#FFB34744',
  },
  demoText: { color: '#FFB347', fontSize: 12, flex: 1 },
  emptyContainer: { padding: 48, alignItems: 'center', gap: 8 },
  emptyText: { color: '#9E9EB8', fontSize: 16, fontWeight: '600' },
  emptySubtext: { color: '#6B6B8A', fontSize: 13 },
});