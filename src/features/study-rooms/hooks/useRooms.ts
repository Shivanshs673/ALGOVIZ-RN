import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { roomsApi } from '../api/roomsApi';
import { demoRoomsService, isDemoRoomId } from '../services/demoRoomsService';
import { useAuthStore } from '../../auth/store/authStore';
import { CreateRoomInput } from '../../../types/studyroom.types';
import { isSupabaseConfigured } from '../../../lib/supabase/client';

async function fetchRooms(category: string) {
  if (!isSupabaseConfigured) {
    return demoRoomsService.getAll(category);
  }
  return roomsApi.getAll(category);
}

export function useRooms() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const { data: rooms = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['rooms', selectedCategory],
    queryFn: () => fetchRooms(selectedCategory),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const usingDemo = !isSupabaseConfigured;

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
      return roomsApi.create(input, user.id, name);
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
    error,
    isDemoMode: usingDemo,
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

  const { data: room, isLoading, isError } = useQuery({
    queryKey: ['room', roomId],
    queryFn: async () => {
      if (!isSupabaseConfigured || isDemoRoomId(roomId)) {
        return demoRoomsService.getById(roomId);
      }
      return roomsApi.getById(roomId);
    },
    staleTime: 30_000,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['room-members', roomId],
    queryFn: async () => {
      if (!isSupabaseConfigured || isDemoRoomId(roomId)) {
        return demoRoomsService.getMembers(roomId);
      }
      return roomsApi.getMembers(roomId);
    },
    staleTime: 10_000,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const name = user.user_metadata?.name ?? 'User';
      if (!isSupabaseConfigured || isDemoRoomId(roomId)) {
        return demoRoomsService.join(roomId, user.id, name);
      }
      await roomsApi.join(roomId, user.id, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-members', roomId] });
      queryClient.invalidateQueries({ queryKey: ['room', roomId] });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      if (!isSupabaseConfigured || isDemoRoomId(roomId)) {
        return demoRoomsService.leave(roomId, user.id);
      }
      await roomsApi.leave(roomId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-members', roomId] });
    },
  });

  const isMember = members.some((m) => m.userId === user?.id);

  return {
    room,
    members,
    isLoading,
    isError,
    isMember,
    isAdmin: false,
    join: joinMutation.mutateAsync,
    leave: leaveMutation.mutateAsync,
  };
}
