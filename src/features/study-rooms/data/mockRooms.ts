// src/features/study-rooms/data/mockRooms.ts
// Updated to use ERD-aligned types (timestamp as number, type field, no id on member)

import type { ChatMessage, PresenceEntry, RoomMember, StudyRoom } from '../../../types/studyroom.types';

const NOW = Date.now();

export const mockRooms: StudyRoom[] = [
  {
    id: 'dp-lab',
    name: 'DP Lab',
    description: 'Practice dynamic programming patterns together.',
    category: 'DYNAMIC_PROGRAMMING',
    createdBy: 'mock-user-001',
    createdAt: NOW,
    memberCount: 14,
    maxMembers: 50,
    isPrivate: false,
    isActive: true,
    lastMessage: 'Trying tabulation first and then switching to memoization.',
    lastMessageAt: NOW,
  },
  {
    id: 'graph-clinic',
    name: 'Graph Clinic',
    description: 'Trace BFS, DFS, and shortest path algorithms.',
    category: 'GRAPH',
    createdBy: 'mock-user-001',
    createdAt: NOW,
    memberCount: 21,
    maxMembers: 50,
    isPrivate: false,
    isActive: true,
    lastMessage: 'Anyone want to trace Dijkstra step by step?',
    lastMessageAt: NOW,
  },
];

export const mockMembers: RoomMember[] = [
  {
    roomId: 'dp-lab',
    userId: 'mock-user-001',
    userName: 'Shiva',
    joinedAt: NOW,
    isOnline: true,
    lastSeenAt: NOW,
    unreadCount: 0,
    isTyping: false,
  },
  {
    roomId: 'dp-lab',
    userId: 'mock-user-002',
    userName: 'Aanya',
    joinedAt: NOW,
    isOnline: true,
    lastSeenAt: NOW,
    unreadCount: 0,
    isTyping: false,
  },
];

export const mockMessages: ChatMessage[] = [
  {
    id: 'm1',
    roomId: 'dp-lab',
    userId: 'mock-user-002',
    userName: 'Aanya',
    content: 'Use the memo table to avoid overlapping subproblems.',
    type: 'TEXT',
    timestamp: NOW,
    edited: false,
    createdAt: new Date(NOW).toISOString(),
  },
];

export const mockPresence: PresenceEntry[] = [
  { userId: 'mock-user-001', userName: 'Shiva', onlineAt: new Date(NOW).toISOString() },
  { userId: 'mock-user-002', userName: 'Aanya', onlineAt: new Date(NOW).toISOString() },
];
