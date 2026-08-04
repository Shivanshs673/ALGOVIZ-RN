import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { roomsApi } from '../api/roomsApi';
import { demoRoomsService, isDemoRoomId } from '../services/demoRoomsService';
import { useAuthStore } from '../../auth/store/authStore';
import { CreateRoomInput, StudyRoom } from '../../../types/studyroom.types';
import { isSupabaseConfigured } from '../../../lib/supabase/client';

type RoomsSource = 'demo' | 'live' | 'fallback';

async function fetchRooms(category: string): Promise<{ rooms: StudyRoom[]; source: RoomsSource }> {
  if (!isSupabaseConfigured) {
    return { rooms: await demoRoomsService.getAll(category), source: 'demo' };
  }
  try {
    const rooms = await roomsApi.getAll(category);
    return { rooms, source: 'live' };
  } catch {
    return { rooms: await demoRoomsService.getAll(category), source: 'fallback' };
  }
}

async function fetchRoomById(roomId: string): Promise<StudyRoom> {
  if (!isSupabaseConfigured || isDemoRoomId(roomId)) {
    return demoRoomsService.getById(roomId);
  }
  try {
    return await roomsApi.getById(roomId);
  } catch {
    return demoRoomsService.getById(roomId);
  }
}

export function useRooms() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['rooms', selectedCategory],
    queryFn: () => fetchRooms(selectedCategory),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const rooms = data?.rooms ?? [];
  const roomsSource = data?.source ?? (isSupabaseConfigured ? 'live' : 'demo');
  const usingDemo = roomsSource !== 'live';

  const filteredRooms = searchQuery.trim()
    ? rooms.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : rooms;

  const createMutation = useMutation({
    mutationFn: async (input: CreateRoomInput) => {
      if (!user) throw new Error('Not authenticated');
      const name = user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'User';
      if (!isSupabaseConfigured) {
        return demoRoomsService.create(input, user.id, name);
      }
      try {
        return await roomsApi.create(input, user.id, name);
      } catch (err) {
        if (__DEV__) {
          console.warn('[StudyRooms] Supabase create failed, using demo room', err);
        }
        return demoRoomsService.create(input, user.id, name);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (roomId: string) => roomsApi.delete(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  const CATEGORIES = [
    'ALL', 'SORTING', 'SEARCHING', 'GRAPH', 'TREE', 'DYNAMIC_PROGRAMMING',
    'GREEDY', 'BACKTRACKING', 'GENERAL', 'INTERVIEW_PREP',
  ];

  return {
    rooms: filteredRooms,
    isLoading,
    error: usingDemo ? null : error,
    isDemoMode: usingDemo,
    roomsSource,
    refetch,
    isFetching,
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

export function useRoom(roomId: string) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const normalizedId = roomId?.trim() ?? '';
  const demo = !normalizedId || isDemoRoomId(normalizedId) || !isSupabaseConfigured;

  const { data: room, isLoading, isError } = useQuery({
    queryKey: ['room', normalizedId],
    queryFn: () => fetchRoomById(normalizedId),
    enabled: Boolean(normalizedId),
    staleTime: 30_000,
    retry: demo ? 0 : 1,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['room-members', normalizedId],
    queryFn: async () => {
      if (demo) {
        return demoRoomsService.getMembers(normalizedId);
      }
      try {
        return await roomsApi.getMembers(normalizedId);
      } catch {
        return demoRoomsService.getMembers(normalizedId);
      }
    },
    enabled: Boolean(normalizedId),
    staleTime: 10_000,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const name = user.user_metadata?.name ?? 'User';
      if (demo) {
        return demoRoomsService.join(normalizedId, user.id, name);
      }
      try {
        await roomsApi.join(normalizedId, user.id, name);
      } catch {
        await demoRoomsService.join(normalizedId, user.id, name);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-members', normalizedId] });
      queryClient.invalidateQueries({ queryKey: ['room', normalizedId] });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      if (demo) {
        return demoRoomsService.leave(normalizedId, user.id);
      }
      try {
        await roomsApi.leave(normalizedId, user.id);
      } catch {
        await demoRoomsService.leave(normalizedId, user.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-members', normalizedId] });
    },
  });

  const isMember = members.some((m) => m.userId === user?.id);

  return {
    room,
    members,
    isLoading: isLoading && Boolean(normalizedId),
    isError,
    isMember,
    isAdmin: false,
    join: joinMutation.mutateAsync,
    leave: leaveMutation.mutateAsync,
  };
}
