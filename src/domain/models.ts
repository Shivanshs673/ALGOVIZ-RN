export type AlgorithmCategory = 'Sorting' | 'Searching' | 'Graph' | 'Dynamic Programming' | 'Strings';

export type PlaybackState = 'idle' | 'playing' | 'paused' | 'completed';

export interface AlgorithmSummary {
  id: string;
  name: string;
  category: AlgorithmCategory;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  offlineReady: boolean;
}

export interface AlgorithmStep {
  id: string;
  title: string;
  detail: string;
}

export interface StudyRoomPreview {
  id: string;
  name: string;
  category: string;
  memberCount: number;
  isPrivate: boolean;
  lastMessage: string;
}

export interface ProfileSummary {
  name: string;
  username: string;
  email: string;
  avatarColorIndex: number;
  completion: number;
}

export interface UpdateStatus {
  versionName: string;
  versionCode: number;
  forceUpdate: boolean;
  releaseNotes: string;
  source: 'GitHub' | 'Supabase';
}