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

export interface ComplexityInfo {
  best: string;
  average: string;
  worst: string;
}

export interface Algorithm {
  id: string;
  name: string;
  category: AlgorithmCategory;
  difficulty: DifficultyLevel;
  description: string;
  pseudocode: string;
  timeComplexity: ComplexityInfo;
  spaceComplexity: string;
  tags: string[];
  applications: string[];
  defaultArraySize?: number;
}

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  state: 'default' | 'visiting' | 'visited' | 'processed' | 'path';
  distance?: number;
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

export interface TreeNode {
  id: string;
  value: number;
  label?: string;
  left?: TreeNode;
  right?: TreeNode;
  state: 'default' | 'visiting' | 'visited' | 'found';
  x?: number;
  y?: number;
}

export interface TrieVizNode {
  id: string;
  char: string;
  x: number;
  y: number;
  state: 'default' | 'visiting' | 'visited' | 'found';
  isEnd?: boolean;
  parentId?: string;
}

export interface VizParams {
  searchTarget?: number;
  kmpText?: string;
  kmpPattern?: string;
  trieWords?: string[];
  bstTarget?: number;
}

export type StepType = 'compare' | 'swap' | 'sorted' | 'visit' | 'process' | 'insert' | 'found' | 'not_found' | 'complete' | 'info';

export interface VisualizationStep {
  array?: number[];
  comparing?: number[];
  swapping?: number[];
  sorted?: number[];
  pivotIndex?: number;
  found?: number;
  searchTarget?: number;
  graphState?: GraphState;
  currentNode?: string;
  queue?: string[];
  stack?: string[];
  treeRoot?: TreeNode;
  currentTreeNode?: string;
  traversalOrder?: number[];
  matrix?: number[][];
  highlightCells?: [number, number][];
  board?: (number | null)[][];
  tryingPosition?: [number, number];
  conflictPositions?: [number, number][];
  trieNodes?: TrieVizNode[];
  message: string;
  comparisons: number;
  swaps: number;
  stepType: StepType;
}

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
  1: 700,
  1.5: 400,
  2: 200,
};