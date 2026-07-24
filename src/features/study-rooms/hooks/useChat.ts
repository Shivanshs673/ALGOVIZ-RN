import { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase/client';
import { messagesApi } from '../api/messagesApi';
import { demoRoomsService } from '../services/demoRoomsService';
import { ChatMessage } from '../../../types/studyroom.types';
import { useAuthStore } from '../../auth/store/authStore';

function isDemoRoom(roomId: string) {
  return !isSupabaseConfigured || roomId.startsWith('demo-') || roomId === 'dp-lab' || roomId === 'graph-clinic';
}

export function useChat(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const user = useAuthStore((s) => s.user);
  const demo = isDemoRoom(roomId);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const loader = demo ? demoRoomsService.getMessages(roomId) : messagesApi.getMessages(roomId);
    loader
      .then((msgs) => { if (!cancelled) setMessages(msgs); })
      .catch(() => { if (!cancelled) setMessages([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [roomId, demo]);

  useEffect(() => {
    if (demo) return;

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
          const row = payload.new as Record<string, unknown>;
          const ts = typeof row.timestamp === 'number' ? row.timestamp : Date.now();
          const newMsg: ChatMessage = {
            id: String(row.id),
            roomId: String(row.room_id),
            userId: String(row.user_id),
            userName: String(row.user_name ?? 'User'),
            content: String(row.content ?? ''),
            type: (row.type as ChatMessage['type']) ?? 'TEXT',
            timestamp: ts,
            edited: false,
            replyToId: row.reply_to_id as string | undefined,
            replyToContent: row.reply_to_content as string | undefined,
            createdAt: new Date(ts).toISOString(),
          };
          setMessages((prev) =>
            prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg],
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, demo]);

  const sendMessage = useCallback(
    async (content: string, replyToId?: string, replyToContent?: string) => {
      if (!user || !content.trim()) return;
      setSending(true);

      const now = Date.now();
      const tempId = `temp-${now}`;
      const userName = user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'User';
      const tempMsg: ChatMessage = {
        id: tempId,
        roomId,
        userId: user.id,
        userName,
        content: content.trim(),
        type: 'TEXT',
        timestamp: now,
        edited: false,
        replyToId,
        replyToContent,
        createdAt: new Date(now).toISOString(),
      };
      setMessages((prev) => [...prev, tempMsg]);

      try {
        if (demo) {
          const sent = await demoRoomsService.send(
            roomId, content, user.id, userName, replyToId, replyToContent,
          );
          setMessages((prev) => prev.map((m) => (m.id === tempId ? sent : m)));
        } else {
          const sent = await messagesApi.send(
            { roomId, content, type: 'TEXT', replyToId, replyToContent },
            user.id,
            userName,
          );
          setMessages((prev) => prev.map((m) => (m.id === tempId ? sent : m)));
        }
      } catch (err) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        throw err;
      } finally {
        setSending(false);
      }
    },
    [roomId, user, demo],
  );

  const deleteMessage = useCallback(async (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    if (!demo) await messagesApi.delete(messageId);
  }, [demo]);

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, content: newContent, edited: true } : m,
      ),
    );
    if (!demo) await messagesApi.edit(messageId, newContent);
  }, [demo]);

  return { messages, loading, sending, sendMessage, deleteMessage, editMessage };
}
