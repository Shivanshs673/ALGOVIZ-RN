# Study Rooms — Full Feature Code
**Files:**
- `src/features/study-rooms/api/roomsApi.ts`
- `src/features/study-rooms/api/messagesApi.ts`
- `src/features/study-rooms/hooks/useRooms.ts`
- `src/features/study-rooms/hooks/useChat.ts`
- `src/features/study-rooms/hooks/usePresence.ts`
- `src/features/study-rooms/components/RoomCard.tsx`
- `src/features/study-rooms/components/CreateRoomModal.tsx`
- `src/features/study-rooms/components/ChatBubble.tsx`
- `src/features/study-rooms/components/MemberList.tsx`
- `app/(tabs)/study-rooms.tsx`
- `app/study-room/[id].tsx`

---

## roomsApi.ts

```typescript
import { supabase } from '../../../lib/supabase/client';
import { StudyRoom, CreateRoomInput } from '../../../types/studyroom.types';

// Map DB snake_case → camelCase
function mapRoom(row: any): StudyRoom {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    category: row.category,
    createdBy: row.created_by,
    createdAt: row.created_at,
    memberCount: row.member_count ?? 0,
    maxMembers: row.max_members ?? 50,
    isPrivate: row.is_private ?? false,
    isActive: row.is_active ?? true,
    lastMessage: row.last_message,
    lastMsgAt: row.last_msg_at,
  };
}

export const roomsApi = {
  // Fetch all active rooms (optionally filtered by category)
  getAll: async (category?: string): Promise<StudyRoom[]> => {
    let query = supabase
      .from('study_rooms')
      .select('*')
      .eq('is_active', true)
      .order('last_msg_at', { ascending: false, nullsFirst: false });
    if (category && category !== 'ALL') {
      query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapRoom);
  },

  // Get single room by id
  getById: async (id: string): Promise<StudyRoom> => {
    const { data, error } = await supabase
      .from('study_rooms')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return mapRoom(data);
  },

  // Create new room + auto-join as admin
  create: async (input: CreateRoomInput, userId: string, userName: string, avatarUrl?: string): Promise<StudyRoom> => {
    const { data, error } = await supabase
      .from('study_rooms')
      .insert({
        name: input.name.trim(),
        description: input.description?.trim() ?? '',
        category: input.category,
        max_members: input.maxMembers ?? 50,
        is_private: input.isPrivate ?? false,
        created_by: userId,
      })
      .select()
      .single();
    if (error) throw error;
    const room = mapRoom(data);

    // Auto-join as admin
    await supabase.from('study_room_members').insert({
      room_id: room.id,
      user_id: userId,
      user_name: userName,
      avatar_url: avatarUrl,
      is_admin: true,
    });

    return room;
  },

  // Soft-delete (only creator can do this)
  delete: async (roomId: string): Promise<void> => {
    const { error } = await supabase
      .from('study_rooms')
      .update({ is_active: false })
      .eq('id', roomId);
    if (error) throw error;
  },

  // Join room
  join: async (roomId: string, userId: string, userName: string, avatarUrl?: string): Promise<void> => {
    const { error } = await supabase.from('study_room_members').upsert({
      room_id: roomId,
      user_id: userId,
      user_name: userName,
      avatar_url: avatarUrl ?? null,
      is_admin: false,
    }, { onConflict: 'room_id,user_id' });
    if (error) throw error;
  },

  // Leave room
  leave: async (roomId: string, userId: string): Promise<void> => {
    const { error } = await supabase
      .from('study_room_members')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  // Get members of a room
  getMembers: async (roomId: string) => {
    const { data, error } = await supabase
      .from('study_room_members')
      .select('*')
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  // Check if user is already a member
  isMember: async (roomId: string, userId: string): Promise<boolean> => {
    const { data } = await supabase
      .from('study_room_members')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .maybeSingle();
    return !!data;
  },
};
```

---

## messagesApi.ts

```typescript
import { supabase } from '../../../lib/supabase/client';
import { ChatMessage, SendMessageInput } from '../../../types/studyroom.types';

function mapMessage(row: any): ChatMessage {
  return {
    id: row.id,
    roomId: row.room_id,
    userId: row.user_id,
    userName: row.user_name,
    content: row.content,
    messageType: row.message_type ?? 'text',
    createdAt: row.created_at,
    edited: row.edited ?? false,
    replyToId: row.reply_to_id,
    isDeleted: row.is_deleted ?? false,
  };
}

export const messagesApi = {
  // Load last 100 messages for a room
  getMessages: async (roomId: string, limit = 100): Promise<ChatMessage[]> => {
    const { data, error } = await supabase
      .from('study_room_messages')
      .select('*')
      .eq('room_id', roomId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(mapMessage);
  },

  // Send a new message
  send: async (input: SendMessageInput, userName: string): Promise<ChatMessage> => {
    const { data, error } = await supabase
      .from('study_room_messages')
      .insert({
        room_id: input.roomId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        user_name: userName,
        content: input.content.trim(),
        message_type: input.messageType ?? 'text',
        reply_to_id: input.replyToId ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return mapMessage(data);
  },

  // Soft delete own message
  delete: async (messageId: string): Promise<void> => {
    const { error } = await supabase
      .from('study_room_messages')
      .update({ is_deleted: true })
      .eq('id', messageId);
    if (error) throw error;
  },

  // Edit own message
  edit: async (messageId: string, newContent: string): Promise<void> => {
    const { error } = await supabase
      .from('study_room_messages')
      .update({ content: newContent.trim(), edited: true })
      .eq('id', messageId);
    if (error) throw error;
  },
};
```

---

## useRooms.ts

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { roomsApi } from '../api/roomsApi';
import { useAuthStore } from '../../auth/store/authStore';
import { CreateRoomInput, RoomCategory } from '../../../types/studyroom.types';

export function useRooms() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);

  // Fetch all rooms
  const { data: rooms = [], isLoading, error } = useQuery({
    queryKey: ['rooms', selectedCategory],
    queryFn: () => roomsApi.getAll(selectedCategory),
    staleTime: 30_000,  // 30 seconds
    refetchOnWindowFocus: true,
  });

  // Filter by search query client-side
  const filteredRooms = searchQuery.trim()
    ? rooms.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rooms;

  // Create room mutation
  const createMutation = useMutation({
    mutationFn: async (input: CreateRoomInput) => {
      if (!user) throw new Error('Not authenticated');
      return roomsApi.create(input, user.id, user.user_metadata?.name ?? 'User');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  // Delete room mutation
  const deleteMutation = useMutation({
    mutationFn: (roomId: string) => roomsApi.delete(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  const CATEGORIES = ['ALL', 'SORTING', 'SEARCHING', 'GRAPH', 'TREE', 'DYNAMIC_PROGRAMMING', 'GREEDY', 'BACKTRACKING', 'GENERAL', 'INTERVIEW_PREP'];

  return {
    rooms: filteredRooms,
    isLoading,
    error,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    categories: CATEGORIES,
    createRoom: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteRoom: deleteMutation.mutateAsync,
  };
}

// Single room hook
export function useRoom(roomId: string) {
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);

  const { data: room, isLoading } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => roomsApi.getById(roomId),
    staleTime: 30_000,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['room-members', roomId],
    queryFn: () => roomsApi.getMembers(roomId),
    staleTime: 10_000,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      await roomsApi.join(roomId, user.id, user.user_metadata?.name ?? 'User');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-members', roomId] });
      queryClient.invalidateQueries({ queryKey: ['room', roomId] });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      await roomsApi.leave(roomId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-members', roomId] });
    },
  });

  const isMember = members.some(m => m.user_id === user?.id);
  const isAdmin = members.some(m => m.user_id === user?.id && m.is_admin);

  return {
    room,
    members,
    isLoading,
    isMember,
    isAdmin,
    join: joinMutation.mutateAsync,
    leave: leaveMutation.mutateAsync,
  };
}
```

---

## useChat.ts

```typescript
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { messagesApi } from '../api/messagesApi';
import { ChatMessage } from '../../../types/studyroom.types';
import { useAuthStore } from '../../auth/store/authStore';

export function useChat(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const user = useAuthStore(s => s.user);

  // Load initial messages
  useEffect(() => {
    setLoading(true);
    messagesApi.getMessages(roomId).then((msgs) => {
      setMessages(msgs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [roomId]);

  // Subscribe to new messages in real-time
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'study_room_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMsg: ChatMessage = {
            id: payload.new.id,
            roomId: payload.new.room_id,
            userId: payload.new.user_id,
            userName: payload.new.user_name,
            content: payload.new.content,
            messageType: payload.new.message_type,
            createdAt: payload.new.created_at,
            edited: false,
            isDeleted: false,
            replyToId: payload.new.reply_to_id,
          };
          // Only add if not already in list (prevent duplicates from optimistic updates)
          setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  // Send message
  const sendMessage = useCallback(async (content: string, replyToId?: string) => {
    if (!user || !content.trim()) return;
    setSending(true);

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempMsg: ChatMessage = {
      id: tempId,
      roomId,
      userId: user.id,
      userName: user.user_metadata?.name ?? 'User',
      content: content.trim(),
      messageType: 'text',
      createdAt: new Date().toISOString(),
      edited: false,
      isDeleted: false,
      replyToId,
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const sent = await messagesApi.send(
        { roomId, content, replyToId },
        user.user_metadata?.name ?? 'User'
      );
      // Replace optimistic message with real one
      setMessages(prev => prev.map(m => m.id === tempId ? sent : m));
    } catch (err) {
      // Remove failed optimistic message
      setMessages(prev => prev.filter(m => m.id !== tempId));
      throw err;
    } finally {
      setSending(false);
    }
  }, [roomId, user]);

  const deleteMessage = useCallback(async (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    await messagesApi.delete(messageId);
  }, []);

  return { messages, loading, sending, sendMessage, deleteMessage };
}
```

---

## usePresence.ts

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { PresenceEntry } from '../../../types/studyroom.types';
import { useAuthStore } from '../../auth/store/authStore';

export function usePresence(roomId: string) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceEntry[]>([]);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`presence:${roomId}`, {
      config: { presence: { key: user.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceEntry>();
        const users = Object.values(state).flat();
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        setOnlineUsers(prev => {
          const existing = new Set(prev.map(u => u.userId));
          const toAdd = (newPresences as PresenceEntry[]).filter(u => !existing.has(u.userId));
          return [...prev, ...toAdd];
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const leftIds = new Set((leftPresences as PresenceEntry[]).map(u => u.userId));
        setOnlineUsers(prev => prev.filter(u => !leftIds.has(u.userId)));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId: user.id,
            userName: user.user_metadata?.name ?? 'User',
            avatarUrl: user.user_metadata?.avatar_url,
            onlineAt: new Date().toISOString(),
          });
          // Update DB
          await supabase
            .from('study_room_members')
            .update({ is_online: true, last_seen_at: new Date().toISOString() })
            .eq('room_id', roomId)
            .eq('user_id', user.id);
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
      // Mark offline in DB
      supabase
        .from('study_room_members')
        .update({ is_online: false, last_seen_at: new Date().toISOString() })
        .eq('room_id', roomId)
        .eq('user_id', user.id);
    };
  }, [roomId, user?.id]);

  return { onlineUsers, onlineCount: onlineUsers.length };
}
```

---

## RoomCard.tsx

```tsx
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
      {/* Category color bar */}
      <View style={[styles.colorBar, { backgroundColor: categoryColor }]} />

      <View style={styles.body}>
        {/* Top row */}
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>{room.name}</Text>
          {room.isPrivate && <Ionicons name="lock-closed" size={14} color="#9E9EB8" />}
        </View>

        {/* Category badge */}
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '22' }]}>
          <Text style={[styles.categoryText, { color: categoryColor }]}>
            {room.category.replace('_', ' ')}
          </Text>
        </View>

        {/* Description */}
        {room.description ? (
          <Text style={styles.description} numberOfLines={2}>{room.description}</Text>
        ) : null}

        {/* Last message */}
        {room.lastMessage && (
          <Text style={styles.lastMessage} numberOfLines={1}>💬 {room.lastMessage}</Text>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          {/* Member count */}
          <View style={styles.memberInfo}>
            <Ionicons name="people" size={14} color={isAlmostFull ? '#FF4757' : '#9E9EB8'} />
            <Text style={[styles.memberCount, isAlmostFull && styles.almostFull]}>
              {room.memberCount}/{room.maxMembers}
            </Text>
          </View>

          {/* Capacity bar */}
          <View style={styles.capacityBarBg}>
            <View style={[styles.capacityBarFill, {
              width: `${Math.min(100, capacityPercent * 100)}%`,
              backgroundColor: isAlmostFull ? '#FF4757' : categoryColor,
            }]} />
          </View>

          {/* Time ago */}
          {room.lastMsgAt && (
            <Text style={styles.timeAgo}>
              {formatDistanceToNow(new Date(room.lastMsgAt), { addSuffix: true })}
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
```

---

## CreateRoomModal.tsx

```tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Switch } from 'react-native';
import { CreateRoomInput, RoomCategory } from '../../../types/studyroom.types';

interface CreateRoomModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: CreateRoomInput) => Promise<void>;
}

const CATEGORIES: RoomCategory[] = ['SORTING','SEARCHING','GRAPH','TREE','DYNAMIC_PROGRAMMING','GREEDY','BACKTRACKING','GENERAL','INTERVIEW_PREP'];

export function CreateRoomModal({ visible, onClose, onSubmit }: CreateRoomModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RoomCategory>('GENERAL');
  const [maxMembers, setMaxMembers] = useState('50');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function validate(): boolean {
    if (name.trim().length < 3) { setError('Name must be at least 3 characters'); return false; }
    if (name.trim().length > 80) { setError('Name must be under 80 characters'); return false; }
    const max = parseInt(maxMembers);
    if (isNaN(max) || max < 2 || max > 200) { setError('Max members must be 2–200'); return false; }
    return true;
  }

  async function handleSubmit() {
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), category, maxMembers: parseInt(maxMembers), isPrivate });
      setName(''); setDescription(''); setCategory('GENERAL'); setMaxMembers('50'); setIsPrivate(false);
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'Failed to create room');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><Text style={styles.cancelBtn}>Cancel</Text></TouchableOpacity>
          <Text style={styles.title}>Create Study Room</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            <Text style={[styles.createBtn, loading && styles.createBtnDisabled]}>
              {loading ? 'Creating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} contentContainerStyle={{ gap: 16, paddingBottom: 40 }}>
          {/* Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Room Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Graph Theory Study Group" placeholderTextColor="#9E9EB8" maxLength={80} />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="What will you study?" placeholderTextColor="#9E9EB8" multiline numberOfLines={3} maxLength={200} />
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity key={cat} onPress={() => setCategory(cat)}
                    style={[styles.categoryChip, cat === category && styles.categoryChipActive]}>
                    <Text style={[styles.categoryChipText, cat === category && styles.categoryChipTextActive]}>
                      {cat.replace(/_/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Max Members */}
          <View style={styles.field}>
            <Text style={styles.label}>Max Members</Text>
            <TextInput style={[styles.input, { width: 80 }]} value={maxMembers} onChangeText={setMaxMembers} keyboardType="numeric" maxLength={3} />
          </View>

          {/* Private toggle */}
          <View style={styles.toggleRow}>
            <Text style={styles.label}>Private Room</Text>
            <Switch value={isPrivate} onValueChange={setIsPrivate} trackColor={{ true: '#6C63FF', false: '#2A2A4A' }} thumbColor="#FFFFFF" />
          </View>

          {/* Error */}
          {!!error && <Text style={styles.errorText}>{error}</Text>}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2A2A4A' },
  cancelBtn: { color: '#9E9EB8', fontSize: 16 },
  title: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  createBtn: { color: '#6C63FF', fontSize: 16, fontWeight: '700' },
  createBtnDisabled: { opacity: 0.5 },
  form: { padding: 16 },
  field: { gap: 8 },
  label: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  input: { backgroundColor: '#1E1E2E', color: '#FFFFFF', borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#2A2A4A' },
  textArea: { height: 80, textAlignVertical: 'top' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#2A2A4A', marginBottom: 4 },
  categoryChipActive: { backgroundColor: '#6C63FF' },
  categoryChipText: { color: '#9E9EB8', fontSize: 12 },
  categoryChipTextActive: { color: '#FFFFFF', fontWeight: '600' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  errorText: { color: '#FF4757', fontSize: 13, textAlign: 'center' },
});
```

---

## Chat Room Screen — app/study-room/[id].tsx

```tsx
import React, { useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../../src/features/study-rooms/hooks/useChat';
import { usePresence } from '../../src/features/study-rooms/hooks/usePresence';
import { useRoom } from '../../src/features/study-rooms/hooks/useRooms';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { Avatar } from '../../src/shared/components/Avatar';
import { ChatMessage } from '../../src/types/studyroom.types';
import { formatDistanceToNow } from 'date-fns';

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const listRef = useRef<FlatList>(null);
  const user = useAuthStore(s => s.user);

  const { room, members, isMember, join, leave } = useRoom(id);
  const { messages, loading, sending, sendMessage } = useChat(id);
  const { onlineUsers, onlineCount } = usePresence(id);

  async function handleSend() {
    if (!input.trim() || !isMember) return;
    const content = input;
    const replyId = replyTo?.id;
    setInput('');
    setReplyTo(null);
    await sendMessage(content, replyId);
  }

  // Scroll to bottom on new message
  React.useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  function renderMessage({ item, index }: { item: ChatMessage; index: number }) {
    const isOwn = item.userId === user?.id;
    const prevMsg = messages[index - 1];
    const showAvatar = !prevMsg || prevMsg.userId !== item.userId;

    return (
      <View style={[styles.msgRow, isOwn && styles.msgRowOwn]}>
        {!isOwn && showAvatar && (
          <Avatar name={item.userName} size={32} style={styles.msgAvatar} />
        )}
        {!isOwn && !showAvatar && <View style={{ width: 32 + 8 }} />}

        <View style={[styles.bubble, isOwn && styles.bubbleOwn]}>
          {showAvatar && !isOwn && (
            <Text style={styles.senderName}>{item.userName}</Text>
          )}
          {item.replyToId && (
            <View style={styles.replyPreview}>
              <Text style={styles.replyText}>↩ Replying to message</Text>
            </View>
          )}
          <Text style={styles.msgText}>{item.content}</Text>
          <Text style={styles.msgTime}>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</Text>
        </View>
      </View>
    );
  }

  if (!room) return null;

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.roomName} numberOfLines={1}>{room.name}</Text>
          <Text style={styles.onlineCount}>{onlineCount} online · {room.memberCount} members</Text>
        </View>
        {/* Members button */}
        <TouchableOpacity style={styles.membersBtn}>
          <Ionicons name="people" size={22} color="#6C63FF" />
          <Text style={styles.membersBtnText}>{room.memberCount}</Text>
        </TouchableOpacity>
      </View>

      {/* Online presence row */}
      {onlineUsers.length > 0 && (
        <View style={styles.presenceRow}>
          {onlineUsers.slice(0, 8).map(u => (
            <Avatar key={u.userId} name={u.userName} size={28} style={styles.presenceAvatar} />
          ))}
          <Text style={styles.presenceText}>{onlineUsers.length} online</Text>
        </View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        {/* Message list */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Join prompt if not member */}
        {!isMember && (
          <View style={styles.joinBanner}>
            <Text style={styles.joinText}>Join this room to chat</Text>
            <TouchableOpacity style={styles.joinBtn} onPress={() => join()}>
              <Text style={styles.joinBtnText}>Join Room</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Reply preview */}
        {replyTo && (
          <View style={styles.replyBar}>
            <Text style={styles.replyBarText} numberOfLines={1}>↩ Replying to {replyTo.userName}: {replyTo.content}</Text>
            <TouchableOpacity onPress={() => setReplyTo(null)}><Ionicons name="close" size={18} color="#9E9EB8" /></TouchableOpacity>
          </View>
        )}

        {/* Input row */}
        {isMember && (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.messageInput}
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              placeholderTextColor="#6B6B8A"
              multiline
              maxLength={4000}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity onPress={handleSend} style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]} disabled={!input.trim() || sending}>
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#2A2A4A', gap: 10 },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1 },
  roomName: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  onlineCount: { color: '#9E9EB8', fontSize: 12 },
  membersBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#2A2A4A', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  membersBtnText: { color: '#6C63FF', fontWeight: '600' },
  presenceRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, gap: 4, backgroundColor: '#1E1E2E' },
  presenceAvatar: { marginLeft: -6 },
  presenceText: { color: '#9E9EB8', fontSize: 11, marginLeft: 8 },
  messageList: { padding: 12, gap: 4 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 4 },
  msgRowOwn: { flexDirection: 'row-reverse' },
  msgAvatar: { marginBottom: 4 },
  bubble: { maxWidth: '75%', backgroundColor: '#1E1E2E', borderRadius: 16, borderBottomLeftRadius: 4, padding: 10, gap: 4 },
  bubbleOwn: { backgroundColor: '#6C63FF', borderBottomLeftRadius: 16, borderBottomRightRadius: 4 },
  senderName: { color: '#6C63FF', fontSize: 12, fontWeight: '700' },
  replyPreview: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 6, padding: 6, borderLeftWidth: 2, borderLeftColor: '#FF6584' },
  replyText: { color: '#9E9EB8', fontSize: 11 },
  msgText: { color: '#FFFFFF', fontSize: 14, lineHeight: 20 },
  msgTime: { color: 'rgba(255,255,255,0.4)', fontSize: 10, alignSelf: 'flex-end' },
  joinBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1E1E2E', borderTopWidth: 1, borderTopColor: '#2A2A4A' },
  joinText: { color: '#9E9EB8', fontSize: 14 },
  joinBtn: { backgroundColor: '#6C63FF', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  joinBtnText: { color: '#FFFFFF', fontWeight: '700' },
  replyBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, backgroundColor: '#1E1E2E', borderTopWidth: 1, borderTopColor: '#2A2A4A' },
  replyBarText: { flex: 1, color: '#9E9EB8', fontSize: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 10, backgroundColor: '#1E1E2E', borderTopWidth: 1, borderTopColor: '#2A2A4A' },
  messageInput: { flex: 1, backgroundColor: '#2A2A4A', color: '#FFFFFF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendBtn: { backgroundColor: '#6C63FF', borderRadius: 50, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
});
```
