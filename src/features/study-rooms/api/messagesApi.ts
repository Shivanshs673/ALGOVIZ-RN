// src/features/study-rooms/api/messagesApi.ts
// Aligned to ERD: study_room_messages uses `type`, `timestamp` (bigint), no is_deleted

import { supabase } from '../../../lib/supabase/client';
import { ChatMessage, SendMessageInput } from '../../../types/studyroom.types';

function mapMessage(row: any): ChatMessage {
  const ts: number = typeof row.timestamp === 'number' ? row.timestamp : Date.now();
  return {
    id: row.id,
    roomId: row.room_id,
    userId: row.user_id,
    userName: row.user_name ?? 'User',
    content: row.content ?? '',
    type: row.type ?? 'TEXT',
    timestamp: ts,
    edited: row.edited ?? false,
    editedAt: row.edited_at ?? undefined,
    codeLanguage: row.code_language ?? undefined,
    replyToId: row.reply_to_id ?? undefined,
    replyToContent: row.reply_to_content ?? undefined,
    // Convenience ISO string for display
    createdAt: new Date(ts).toISOString(),
  };
}

export const messagesApi = {
  // Load last N messages ordered by timestamp asc
  getMessages: async (roomId: string, limit = 100): Promise<ChatMessage[]> => {
    const { data, error } = await supabase
      .from('study_room_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('timestamp', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(mapMessage);
  },

  // Send a new message
  send: async (input: SendMessageInput, userId: string, userName: string): Promise<ChatMessage> => {
    const now = Date.now();
    const { data, error } = await supabase
      .from('study_room_messages')
      .insert({
        room_id: input.roomId,
        user_id: userId,
        user_name: userName,
        content: input.content.trim(),
        type: input.type ?? 'TEXT',
        timestamp: now,
        reply_to_id: input.replyToId ?? null,
        reply_to_content: input.replyToContent ?? null,
      })
      .select()
      .single();
    if (error) throw error;

    // Update room last_message preview (best-effort, don't block on failure)
    void Promise.resolve(
      supabase
        .from('study_rooms')
        .update({ last_message: input.content.trim(), last_message_at: now })
        .eq('id', input.roomId),
    ).catch(() => undefined);

    return mapMessage(data);
  },

  // Edit own message
  edit: async (messageId: string, newContent: string): Promise<void> => {
    const { error } = await supabase
      .from('study_room_messages')
      .update({ content: newContent.trim(), edited: true, edited_at: Date.now() })
      .eq('id', messageId);
    if (error) throw error;
  },

  // Hard-delete own message (RLS enforces ownership)
  delete: async (messageId: string): Promise<void> => {
    const { error } = await supabase
      .from('study_room_messages')
      .delete()
      .eq('id', messageId);
    if (error) throw error;
  },
};
