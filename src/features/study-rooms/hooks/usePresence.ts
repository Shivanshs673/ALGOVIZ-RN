import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase/client';
import { PresenceEntry } from '../../../types/studyroom.types';
import { useAuthStore } from '../../auth/store/authStore';
import { isDemoRoomId } from '../services/demoRoomsService';

export function usePresence(roomId: string) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceEntry[]>([]);
  const user = useAuthStore(s => s.user);
  const normalizedId = roomId?.trim() ?? '';

  useEffect(() => {
    if (!user || !normalizedId || !isSupabaseConfigured || isDemoRoomId(normalizedId)) return;

    const channel = supabase.channel(`presence:${normalizedId}`, {
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
          const toAdd = (newPresences as unknown as PresenceEntry[]).filter(u => !existing.has(u.userId));
          return [...prev, ...toAdd];
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const leftIds = new Set((leftPresences as unknown as PresenceEntry[]).map(u => u.userId));
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
          await supabase
            .from('study_room_members')
            .update({ is_online: true, last_seen_at: Date.now() })
            .eq('room_id', normalizedId)
            .eq('user_id', user.id);
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
      supabase
        .from('study_room_members')
        .update({ is_online: false, last_seen_at: Date.now() })
        .eq('room_id', normalizedId)
        .eq('user_id', user.id);
    };
  }, [normalizedId, user?.id]);

  return { onlineUsers, onlineCount: onlineUsers.length };
}
