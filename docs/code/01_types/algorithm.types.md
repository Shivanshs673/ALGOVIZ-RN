# TypeScript Types — Algorithm & Visualization
**File path in RN project:** `src/types/algorithm.types.ts`

---

```typescript
// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export type AlgorithmCategory =
  | 'SORTING'
  | 'SEARCHING'
  | 'GRAPH'
  | 'TREE'
  | 'DYNAMIC_PROGRAMMING'
  | 'GREEDY'
  | 'BACKTRACKING'
  | 'DIVIDE_AND_CONQUER'
  | 'STRING'
  | 'TRIE';

export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

// ─────────────────────────────────────────────
// COMPLEXITY
// ─────────────────────────────────────────────

export interface ComplexityInfo {
  best: string;
  average: string;
  worst: string;
}

// ─────────────────────────────────────────────
// ALGORITHM DEFINITION (static metadata)
// ─────────────────────────────────────────────

export interface Algorithm {
  id: string;                        // e.g. 'bubble-sort'
  name: string;                      // e.g. 'Bubble Sort'
  category: AlgorithmCategory;
  difficulty: DifficultyLevel;
  description: string;               // Plain-English description
  pseudocode: string;                // Formatted pseudocode (newline-separated)
  timeComplexity: ComplexityInfo;
  spaceComplexity: string;           // e.g. 'O(1)'
  tags: string[];                    // e.g. ['comparison', 'in-place', 'stable']
  applications: string[];            // Real-world uses
  defaultArraySize?: number;         // Default input size (default: 8)
}

// ─────────────────────────────────────────────
// GRAPH STRUCTURES (used by graph engine)
// ─────────────────────────────────────────────

export interface GraphNode {
  id: string;
  label: string;
  x: number;          // Canvas position
  y: number;
  state: 'default' | 'visiting' | 'visited' | 'processed' | 'path';
  distance?: number;  // For Dijkstra
}

export interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
  directed?: boolean;
  state: 'default' | 'active' | 'inMST' | 'path';
}

export interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ─────────────────────────────────────────────
// TREE STRUCTURES (used by tree engine)
// ─────────────────────────────────────────────

export interface TreeNode {
  id: string;
  value: number;
  left?: TreeNode;
  right?: TreeNode;
  state: 'default' | 'visiting' | 'visited' | 'found';
  x?: number;        // Layout position
  y?: number;
}

// ─────────────────────────────────────────────
// VISUALIZATION STEP (output of every engine)
// ─────────────────────────────────────────────

export interface VisualizationStep {
  // Array-based algorithms (sorting, searching)
  array?: number[];
  comparing?: number[];    // Indices currently being compared
  swapping?: number[];     // Indices being swapped
  sorted?: number[];       // Indices confirmed sorted/done
  pivotIndex?: number;     // Quick sort pivot
  found?: number;          // Index of found element (searching)
  searchTarget?: number;   // The value being searched

  // Graph algorithms
  graphState?: GraphState;
  currentNode?: string;    // Currently processing node id
  queue?: string[];        // BFS queue
  stack?: string[];        // DFS stack

  // Tree algorithms
  treeRoot?: TreeNode;
  currentTreeNode?: string;
  traversalOrder?: number[];  // Order visited so far

  // DP algorithms
  matrix?: number[][];     // DP table state
  highlightCells?: [number, number][];  // Currently computing cell

  // Backtracking
  board?: (number | null)[][];  // Grid state (N-Queens / Sudoku)
  tryingPosition?: [number, number];
  conflictPositions?: [number, number][];

  // Universal
  message: string;         // Human-readable step explanation
  comparisons: number;     // Running comparisons count
  swaps: number;           // Running swaps count
  stepType: StepType;
}

export type StepType =
  | 'compare'
  | 'swap'
  | 'sorted'
  | 'visit'
  | 'process'
  | 'insert'
  | 'found'
  | 'not_found'
  | 'complete'
  | 'info';

// ─────────────────────────────────────────────
// PLAYBACK STATE (Zustand store shape)
// ─────────────────────────────────────────────

export interface VisualizationState {
  algorithmId: string | null;
  steps: VisualizationStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  speed: PlaybackSpeed;
  inputArray: number[];
  customInput: string;
  status: 'idle' | 'loaded' | 'playing' | 'paused' | 'completed';
}

export type PlaybackSpeed = 0.5 | 1 | 1.5 | 2;

export const SPEED_DELAY_MS: Record<PlaybackSpeed, number> = {
  0.5: 1200,
  1:   700,
  1.5: 400,
  2:   200,
};
```
