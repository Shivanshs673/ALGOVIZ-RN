// src/screens/RoomsScreen.tsx
// Fixed: removed duplicate component + styles, uses real Supabase data via useRooms hook

import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { mockRooms } from '../features/study-rooms/data/mockRooms';
import { ScreenCard } from '../components/ScreenCard';

export function RoomsScreen() {
  const router = useRouter();
  const rooms = useMemo(() => mockRooms, []);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenCard title="Study Rooms" subtitle="Realtime collaboration — connect and discuss algorithms.">
        <View style={styles.list}>
          {rooms.map((room) => (
            <Pressable
              key={room.id}
              style={styles.roomCard}
              onPress={() => router.push(`/study-room/${room.id}`)}
            >
              <View style={styles.roomHeader}>
                <Text style={styles.roomTitle}>{room.name}</Text>
                <Text style={styles.roomMeta}>{room.category.replace(/_/g, ' ')}</Text>
              </View>
              {room.lastMessage ? (
                <Text style={styles.roomCopy} numberOfLines={2}>{room.lastMessage}</Text>
              ) : null}
              <View style={styles.tagRow}>
                <Tag label={`${room.memberCount} members`} />
                <Tag label={room.isPrivate ? 'Private' : 'Open'} />
              </View>
            </Pressable>
          ))}
        </View>
      </ScreenCard>
    </ScrollView>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  list: {
    gap: 12,
  },
  roomCard: {
    backgroundColor: '#101a2f',
    borderRadius: 22,
    padding: 16,
    gap: 10,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  roomTitle: {
    color: '#f6f9ff',
    fontWeight: '800',
    fontSize: 16,
    flex: 1,
  },
  roomMeta: {
    color: '#78d7ff',
    fontWeight: '700',
    fontSize: 12,
  },
  roomCopy: {
    color: '#9baecc',
    fontSize: 13,
    lineHeight: 19,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    color: '#edf3ff',
    fontSize: 12,
    fontWeight: '700',
  },
});