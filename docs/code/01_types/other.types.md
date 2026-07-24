# TypeScript Types — Study Room, User, Navigation
**Files in RN project:**
- `src/types/studyroom.types.ts`
- `src/types/user.types.ts`
- `src/types/navigation.types.ts`

---

## studyroom.types.ts

```typescript
// ─────────────────────────────────────────────
// STUDY ROOM
// ─────────────────────────────────────────────

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
  createdBy: string;           // user_id of creator
  createdAt: string;           // ISO 8601
  memberCount: number;
  maxMembers: number;
  isPrivate: boolean;
  isActive: boolean;
  lastMessage?: string;
  lastMsgAt?: string;
}

export interface CreateRoomInput {
  name: string;
  description: string;
  category: RoomCategory;
  maxMembers?: number;         // default 50
  isPrivate?: boolean;         // default false
}

// ─────────────────────────────────────────────
// ROOM MEMBER
// ─────────────────────────────────────────────

export interface RoomMember {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  joinedAt: string;
  isOnline: boolean;
  lastSeenAt: string;
  isAdmin: boolean;
}

// ─────────────────────────────────────────────
// CHAT MESSAGE
// ─────────────────────────────────────────────

export type MessageType = 'text' | 'code' | 'system';

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  content: string;
  messageType: MessageType;
  createdAt: string;           // ISO 8601
  edited: boolean;
  replyToId?: string;
  isDeleted: boolean;
  replyTo?: ChatMessage;       // Populated on read
}

export interface SendMessageInput {
  roomId: string;
  content: string;
  messageType?: MessageType;
  replyToId?: string;
}

// ─────────────────────────────────────────────
// PRESENCE
// ─────────────────────────────────────────────

export interface PresenceEntry {
  userId: string;
  userName: string;
  avatarUrl?: string;
  onlineAt: string;
}
```

---

## user.types.ts

```typescript
// ─────────────────────────────────────────────
// USER PROFILE
// ─────────────────────────────────────────────

export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface UserProfile {
  userId: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  skillLevel: SkillLevel;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  name?: string;
  username?: string;
  bio?: string;
  skillLevel?: SkillLevel;
}

// ─────────────────────────────────────────────
// PROGRESS TRACKING
// ─────────────────────────────────────────────

export interface UserProgress {
  id: string;
  userId: string;
  algorithmId: string;
  viewed: boolean;
  completed: boolean;
  viewCount: number;
  lastViewedAt?: string;
  createdAt: string;
}

export interface UpsertProgressInput {
  algorithmId: string;
  viewed?: boolean;
  completed?: boolean;
}

// ─────────────────────────────────────────────
// PROGRESS SUMMARY (derived / computed)
// ─────────────────────────────────────────────

export interface ProgressSummary {
  totalAlgorithms: number;         // 38
  totalViewed: number;
  totalCompleted: number;
  overallPercent: number;          // 0–100
  byCategory: CategoryProgress[];
  recentActivity: RecentActivity[];
}

export interface CategoryProgress {
  category: string;
  total: number;
  viewed: number;
  completed: number;
  percent: number;
}

export interface RecentActivity {
  algorithmId: string;
  algorithmName: string;
  lastViewedAt: string;
}
```

---

## navigation.types.ts

```typescript
// Route params for Expo Router dynamic routes
// Usage: const { id } = useLocalSearchParams<AlgorithmDetailParams>();

export interface AlgorithmDetailParams {
  id: string;             // algorithm id e.g. 'bubble-sort'
}

export interface StudyRoomParams {
  id: string;             // room UUID
}

// Tab route names
export type TabRoute = 'home' | 'study-rooms' | 'learn' | 'progress' | 'profile';
```
