import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockMessages, mockMembers, mockRooms } from '../data/mockRooms';
import { ChatMessage, CreateRoomInput, RoomMember, StudyRoom } from '../../../types/studyroom.types';

const DEMO_ROOMS_KEY = 'algoviz.demo.rooms';
const demoMsgKey = (roomId: string) => `algoviz.demo.messages.${roomId}`;

export const DEMO_ROOM_IDS = new Set(mockRooms.map((r) => r.id));

export function isDemoRoomId(roomId: string): boolean {
  return DEMO_ROOM_IDS.has(roomId) || roomId.startsWith('demo-');
}

async function loadStoredRooms(): Promise<StudyRoom[]> {
  try {
    const raw = await AsyncStorage.getItem(DEMO_ROOMS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [...mockRooms];
}

async function saveRooms(rooms: StudyRoom[]) {
  await AsyncStorage.setItem(DEMO_ROOMS_KEY, JSON.stringify(rooms));
}

export const demoRoomsService = {
  getAll: async (category?: string): Promise<StudyRoom[]> => {
    const rooms = await loadStoredRooms();
    if (category && category !== 'ALL') {
      return rooms.filter((r) => r.category === category && r.isActive);
    }
    return rooms.filter((r) => r.isActive);
  },

  getById: async (id: string): Promise<StudyRoom> => {
    const rooms = await loadStoredRooms();
    const room = rooms.find((r) => r.id === id);
    if (!room) throw new Error('Room not found');
    return room;
  },

  create: async (input: CreateRoomInput, userId: string, userName: string): Promise<StudyRoom> => {
    const rooms = await loadStoredRooms();
    const now = Date.now();
    const room: StudyRoom = {
      id: `demo-${now}`,
      name: input.name.trim(),
      description: input.description?.trim() ?? '',
      category: input.category,
      createdBy: userId,
      createdAt: now,
      memberCount: 1,
      maxMembers: input.maxMembers ?? 50,
      isPrivate: input.isPrivate ?? false,
      isActive: true,
      lastMessage: undefined,
      lastMessageAt: undefined,
    };
    rooms.unshift(room);
    await saveRooms(rooms);
    await AsyncStorage.setItem(demoMsgKey(room.id), JSON.stringify([]));
    return room;
  },

  getMembers: async (roomId: string): Promise<RoomMember[]> => {
    return mockMembers.filter((m) => m.roomId === roomId);
  },

  join: async (_roomId: string, _userId: string, _userName: string) => undefined,

  leave: async (_roomId: string, _userId: string) => undefined,

  getMessages: async (roomId: string): Promise<ChatMessage[]> => {
    try {
      const raw = await AsyncStorage.getItem(demoMsgKey(roomId));
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return mockMessages.filter((m) => m.roomId === roomId);
  },

  send: async (
    roomId: string,
    content: string,
    userId: string,
    userName: string,
    replyToId?: string,
    replyToContent?: string,
  ): Promise<ChatMessage> => {
    const now = Date.now();
    const msg: ChatMessage = {
      id: `demo-msg-${now}`,
      roomId,
      userId,
      userName,
      content: content.trim(),
      type: 'TEXT',
      timestamp: now,
      edited: false,
      replyToId,
      replyToContent,
      createdAt: new Date(now).toISOString(),
    };
    const existing = await demoRoomsService.getMessages(roomId);
    await AsyncStorage.setItem(demoMsgKey(roomId), JSON.stringify([...existing, msg]));
    return msg;
  },
};
