// src/types/user.types.ts
// Aligned to ERD: docs/04_ERD.md — user_profiles table

export interface UserProfile {
  userId: string;
  name: string;
  username: string;
  email: string;
  phoneNo: string;
  avatarUrl?: string;
  avatarColorIndex: number;
  updatedAt?: number; // epoch millis
}

export interface UpdateProfileInput {
  name?: string;
  username?: string;
  email?: string;
  phoneNo?: string;
  avatarColorIndex?: number;
}

// Progress types — local AsyncStorage with optional Supabase `user_progress` sync
export interface UserProgress {
  algorithmId: string;
  viewed: boolean;
  completed: boolean;
  viewCount: number;
  lastViewedAt?: string;
}

export interface UpsertProgressInput {
  algorithmId: string;
  viewed?: boolean;
  completed?: boolean;
}

export interface ProgressSummary {
  totalAlgorithms: number;
  totalViewed: number;
  totalCompleted: number;
  overallPercent: number;
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