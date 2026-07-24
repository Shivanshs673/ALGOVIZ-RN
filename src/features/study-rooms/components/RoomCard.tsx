import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StudyRoom } from '../../../types/studyroom.types';
import { formatDistanceToNow } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

interface RoomCardProps {
  room: StudyRoom;
  onPress: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  SORTING: '#6C63FF',
  SEARCHING: '#FF6584',
  GRAPH: '#43C59E',
  TREE: '#FFB347',
  DYNAMIC_PROGRAMMING: '#A78BFA',
  GREEDY: '#34D399',
  BACKTRACKING: '#F87171',
  GENERAL: '#9E9EB8',
  INTERVIEW_PREP: '#FBBF24',
};

export function RoomCard({ room, onPress }: RoomCardProps) {
  const categoryColor = CATEGORY_COLORS[room.category] ?? '#6C63FF';
  const capacityPercent = room.memberCount / room.maxMembers;
  const isAlmostFull = capacityPercent >= 0.8;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.colorBar, { backgroundColor: categoryColor }]} />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>{room.name}</Text>
          {room.isPrivate && <Ionicons name="lock-closed" size={14} color="#9E9EB8" />}
        </View>

        <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '22' }]}>
          <Text style={[styles.categoryText, { color: categoryColor }]}>
            {room.category.replace('_', ' ')}
          </Text>
        </View>

        {room.description ? (
          <Text style={styles.description} numberOfLines={2}>{room.description}</Text>
        ) : null}

        {room.lastMessage && (
          <Text style={styles.lastMessage} numberOfLines={1}>💬 {room.lastMessage}</Text>
        )}

        <View style={styles.footer}>
          <View style={styles.memberInfo}>
            <Ionicons name="people" size={14} color={isAlmostFull ? '#FF4757' : '#9E9EB8'} />
            <Text style={[styles.memberCount, isAlmostFull && styles.almostFull]}>
              {room.memberCount}/{room.maxMembers}
            </Text>
          </View>

          <View style={styles.capacityBarBg}>
            <View style={[styles.capacityBarFill, {
              width: `${Math.min(100, capacityPercent * 100)}%`,
              backgroundColor: isAlmostFull ? '#FF4757' : categoryColor,
            }]} />
          </View>

          {room.lastMessageAt && (
            <Text style={styles.timeAgo}>
              {formatDistanceToNow(new Date(room.lastMessageAt), { addSuffix: true })}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: '#1E1E2E', borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  colorBar: { width: 4 },
  body: { flex: 1, padding: 14, gap: 6 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flex: 1, color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  categoryBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  categoryText: { fontSize: 11, fontWeight: '600' },
  description: { color: '#9E9EB8', fontSize: 13, lineHeight: 18 },
  lastMessage: { color: '#6B6B8A', fontSize: 12, fontStyle: 'italic' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  memberInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  memberCount: { color: '#9E9EB8', fontSize: 12 },
  almostFull: { color: '#FF4757' },
  capacityBarBg: { flex: 1, height: 4, backgroundColor: '#2A2A4A', borderRadius: 2, overflow: 'hidden' },
  capacityBarFill: { height: '100%', borderRadius: 2 },
  timeAgo: { color: '#6B6B8A', fontSize: 11 },
});
