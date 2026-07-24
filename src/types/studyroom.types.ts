// src/types/studyroom.types.ts
// Aligned to ERD: docs/04_ERD.md

export type RoomCategory =
  | 'SORTING'
  | 'SEARCHING'
  | 'GRAPH'
  | 'TREE'
  | 'DYNAMIC_PROGRAMMING'
  | 'GREEDY'
  | 'BACKTRACKING'
  | 'GENERAL'
  | 'INTERVIEW_PREP';

export interface StudyRoom {
  id: string;
  name: string;
  description: string;
  category: RoomCategory;
  createdBy: string;
  createdAt: number;       // bigint epoch millis
  memberCount: number;
  maxMembers: number;
  isPrivate: boolean;
  isActive: boolean;
  lastMessage?: string;
  lastMessageAt?: number;  // bigint epoch millis (ERD: last_message_at)
}

export interface CreateRoomInput {
  name: string;
  description: string;
  category: RoomCategory;
  maxMembers?: number;
  isPrivate?: boolean;
}

export interface RoomMember {
  roomId: string;          // PK part 1
  userId: string;          // PK part 2
  userName: string;        // denormalized display
  joinedAt: number;        // bigint epoch millis
  isOnline: boolean;
  lastSeenAt?: number;
  unreadCount: number;
  isTyping: boolean;
  typingAt?: number;
}

// ERD: type TEXT default 'TEXT' — TEXT, CODE, IMAGE, FILE, AUDIO, SYSTEM
export type MessageType = 'TEXT' | 'CODE' | 'IMAGE' | 'FILE' | 'AUDIO' | 'SYSTEM' | 'text' | 'code';

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  content: string;
  type: MessageType;       // ERD: type (not message_type)
  timestamp: number;       // ERD: bigint epoch millis
  edited: boolean;
  editedAt?: number;
  codeLanguage?: string;
  replyToId?: string;
  replyToContent?: string;
  // Convenience: ISO string for UI display
  createdAt: string;
}

export interface SendMessageInput {
  roomId: string;
  content: string;
  type?: MessageType;
  replyToId?: string;
  replyToContent?: string;
}

export interface PresenceEntry {
  userId: string;
  userName: string;
  avatarUrl?: string;
  onlineAt: string;
}