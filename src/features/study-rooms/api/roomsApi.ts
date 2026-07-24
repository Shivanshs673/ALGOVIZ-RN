// src/features/study-rooms/api/roomsApi.ts
// Aligned to ERD: docs/04_ERD.md — study_rooms, study_room_members tables

import { supabase } from '../../../lib/supabase/client';
import { StudyRoom, CreateRoomInput, RoomMember } from '../../../types/studyroom.types';

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
    lastMessage: row.last_message ?? undefined,
    lastMessageAt: row.last_message_at ?? undefined, // ERD: last_message_at
  };
}

function mapMember(row: any): RoomMember {
  return {
    roomId: row.room_id,
    userId: row.user_id,
    userName: row.user_name ?? 'User',
    joinedAt: row.joined_at ?? Date.now(),
    isOnline: row.is_online ?? false,
    lastSeenAt: row.last_seen_at ?? undefined,
    unreadCount: row.unread_count ?? 0,
    isTyping: row.is_typing ?? false,
    typingAt: row.typing_at ?? undefined,
  };
}

export const roomsApi = {
  // Fetch all active rooms, optionally filtered by category
  getAll: async (category?: string): Promise<StudyRoom[]> => {
    let query = supabase
      .from('study_rooms')
      .select('*')
      .eq('is_active', true)
      .order('last_message_at', { ascending: false, nullsFirst: false });
    if (category && category !== 'ALL') {
      query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapRoom);
  },

  // Get a single room by ID
  getById: async (id: string): Promise<StudyRoom> => {
    const { data, error } = await supabase
      .from('study_rooms')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return mapRoom(data);
  },

  // Create a new room and auto-join as first member
  create: async (input: CreateRoomInput, userId: string, userName: string): Promise<StudyRoom> => {
    const now = Date.now();
    const { data, error } = await supabase
      .from('study_rooms')
      .insert({
        name: input.name.trim(),
        description: input.description?.trim() ?? '',
        category: input.category,
        created_by: userId,
        created_at: now,
        max_members: input.maxMembers ?? 50,
        is_private: input.isPrivate ?? false,
        member_count: 1,
        is_active: true,
      })
      .select()
      .single();
    if (error) throw error;
    const room = mapRoom(data);

    // Auto-join creator as member — ERD fields only
    await supabase.from('study_room_members').insert({
      room_id: room.id,
      user_id: userId,
      user_name: userName,
      joined_at: now,
      is_online: true,
      last_seen_at: now,
      unread_count: 0,
      is_typing: false,
    });

    return room;
  },

  // Soft-delete room (set is_active = false)
  delete: async (roomId: string): Promise<void> => {
    const { error } = await supabase
      .from('study_rooms')
      .update({ is_active: false })
      .eq('id', roomId);
    if (error) throw error;
  },

  // Join a room (upsert member row)
  join: async (roomId: string, userId: string, userName: string): Promise<void> => {
    const now = Date.now();
    const { error } = await supabase
      .from('study_room_members')
      .upsert(
        {
          room_id: roomId,
          user_id: userId,
          user_name: userName,
          joined_at: now,
          is_online: true,
          last_seen_at: now,
          unread_count: 0,
          is_typing: false,
        },
        { onConflict: 'room_id,user_id' }
      );
    if (error) throw error;

    // Increment member_count (best effort)
    void Promise.resolve(
      supabase.rpc('increment_member_count', { room_id_param: roomId }),
    ).catch(() => undefined);
  },

  // Leave a room
  leave: async (roomId: string, userId: string): Promise<void> => {
    const { error } = await supabase
      .from('study_room_members')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  // Get all members of a room
  getMembers: async (roomId: string): Promise<RoomMember[]> => {
    const { data, error } = await supabase
      .from('study_room_members')
      .select('*')
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapMember);
  },

  // Check if a user is already a member
  isMember: async (roomId: string, userId: string): Promise<boolean> => {
    const { data } = await supabase
      .from('study_room_members')
      .select('room_id')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .maybeSingle();
    return !!data;
  },

  // Update member typing state
  setTyping: async (roomId: string, userId: string, isTyping: boolean): Promise<void> => {
    await supabase
      .from('study_room_members')
      .update({ is_typing: isTyping, typing_at: isTyping ? Date.now() : null })
      .eq('room_id', roomId)
      .eq('user_id', userId);
  },

  // Update member online state
  setOnline: async (roomId: string, userId: string, isOnline: boolean): Promise<void> => {
    await supabase
      .from('study_room_members')
      .update({ is_online: isOnline, last_seen_at: Date.now() })
      .eq('room_id', roomId)
      .eq('user_id', userId);
  },
};
