import type { AlgorithmStep, AlgorithmSummary, ProfileSummary, StudyRoomPreview, UpdateStatus } from '../domain/models';

export const featurePillars = [
  {
    title: 'Auth',
    description: 'Email, Google, session restore, password reset, and profile completion gating.',
  },
  {
    title: 'Algorithms',
    description: 'Local catalog with offline step playback for sorting, graphs, DP, and more.',
  },
  {
    title: 'Study rooms',
    description: 'Realtime chat, membership, presence, and room lifecycle flows.',
  },
  {
    title: 'Profile',
    description: 'Local-first profile cache, avatar upload, and Supabase sync.',
  },
];

export const appHighlights = [
  {
    title: 'Cross-platform foundation',
    description: 'React Native + TypeScript starter prepared for Android and iOS delivery.',
  },
  {
    title: 'Backend-ready structure',
    description: 'Clear place for Supabase client, repositories, and feature state machines.',
  },
  {
    title: 'Docs-aligned scope',
    description: 'The first implementation step mirrors the product, architecture, and data docs.',
  },
];

export const appRoadmap = [
  {
    title: 'Navigation and screens',
    detail: 'Introduce stack and tab routing for login, home, algorithms, rooms, profile, and updates.',
  },
  {
    title: 'Supabase integration',
    detail: 'Add auth, profile, study room, and storage modules using typed service layers.',
  },
  {
    title: 'Algorithm engine',
    detail: 'Build the local visualization engine and step playback for offline learning.',
  },
  {
    title: 'Realtime room flows',
    detail: 'Wire chat, presence, and unread state into a robust mobile experience.',
  },
];

export const algorithms: AlgorithmSummary[] = [
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'Sorting',
    difficulty: 'Easy',
    description: 'A simple comparison sort to show swaps and pass-by-pass behavior.',
    offlineReady: true,
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'Searching',
    difficulty: 'Easy',
    description: 'Divide and conquer search over sorted arrays with clear step highlights.',
    offlineReady: true,
  },
  {
    id: 'dijkstra',
    name: 'Dijkstra',
    category: 'Graph',
    difficulty: 'Hard',
    description: 'Shortest path visualization with frontier updates and visited nodes.',
    offlineReady: true,
  },
  {
    id: 'knapsack',
    name: '0/1 Knapsack',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    description: 'Table-driven dynamic programming with capacity decisions.',
    offlineReady: true,
  },
  {
    id: 'kmp',
    name: 'KMP String Match',
    category: 'Strings',
    difficulty: 'Medium',
    description: 'Pattern matching with prefix table and efficient backtracking avoidance.',
    offlineReady: true,
  },
];

export const algorithmSteps: Record<string, AlgorithmStep[]> = {
  'bubble-sort': [
    { id: '1', title: 'Load array', detail: 'Initialize the array bars and the first pass boundary.' },
    { id: '2', title: 'Compare neighbors', detail: 'Highlight adjacent items and compare values.' },
    { id: '3', title: 'Swap if needed', detail: 'Swap out-of-order values and advance the pass.' },
    { id: '4', title: 'Complete', detail: 'Mark the array sorted after the final pass.' },
  ],
  'binary-search': [
    { id: '1', title: 'Set bounds', detail: 'Start with low and high pointers around the sorted array.' },
    { id: '2', title: 'Inspect middle', detail: 'Calculate the midpoint and compare target to middle value.' },
    { id: '3', title: 'Narrow search', detail: 'Move low or high based on the comparison outcome.' },
    { id: '4', title: 'Return result', detail: 'Finish when the target is found or the range collapses.' },
  ],
  dijkstra: [
    { id: '1', title: 'Seed source', detail: 'Mark the source node as distance zero and push to queue.' },
    { id: '2', title: 'Relax edges', detail: 'Visit neighbors and update best-known distances.' },
    { id: '3', title: 'Choose frontier', detail: 'Advance to the next lowest-cost unvisited node.' },
    { id: '4', title: 'Finalize paths', detail: 'Stop when every reachable node has been processed.' },
  ],
  knapsack: [
    { id: '1', title: 'Initialize table', detail: 'Create the capacity by item dynamic programming grid.' },
    { id: '2', title: 'Fill choices', detail: 'Compare include versus exclude for each state.' },
    { id: '3', title: 'Backtrack result', detail: 'Recover the selected items from the populated table.' },
  ],
  kmp: [
    { id: '1', title: 'Build prefix table', detail: 'Precompute fallback positions for the pattern.' },
    { id: '2', title: 'Scan text', detail: 'Walk through the text while tracking matched prefix length.' },
    { id: '3', title: 'Match found', detail: 'Record each match and continue efficiently.' },
  ],
};

export const rooms: StudyRoomPreview[] = [
  {
    id: 'dp-lab',
    name: 'DP Lab',
    category: 'Dynamic Programming',
    memberCount: 14,
    isPrivate: false,
    lastMessage: 'Trying tabulation first and then switching to memoization.',
  },
  {
    id: 'graph-clinic',
    name: 'Graph Clinic',
    category: 'Graph Theory',
    memberCount: 21,
    isPrivate: false,
    lastMessage: 'Anyone want to trace Dijkstra step by step?',
  },
  {
    id: 'sorting-hub',
    name: 'Sorting Hub',
    category: 'Algorithms',
    memberCount: 9,
    isPrivate: true,
    lastMessage: 'Merge sort has the clearest visual split for new learners.',
  },
];

export const profileSummary: ProfileSummary = {
  name: 'Shiva',
  username: 'shivansh',
  email: 'shiva@example.com',
  avatarColorIndex: 4,
  completion: 72,
};

export const updateStatus: UpdateStatus = {
  versionName: '2.0.14',
  versionCode: 19,
  forceUpdate: false,
  releaseNotes: 'Improved auth flow, profile hydration, and study room stability.',
  source: 'GitHub',
};