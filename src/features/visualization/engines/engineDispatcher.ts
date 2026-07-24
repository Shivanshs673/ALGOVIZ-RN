import { VisualizationStep, VizParams } from '../../../types/algorithm.types';
import { getSortingSteps } from './SortingEngine';
import { getSearchingSteps } from './SearchingEngine';
import { getGraphSteps } from './GraphEngine';
import { getTreeSteps } from './TreeEngine';
import { getDPSteps } from './DPEngine';
import { getBacktrackingSteps } from './BacktrackingEngine';
import { getGreedySteps } from './GreedyEngine';
import { getStringSteps } from './StringEngine';
import { getAdditionalSteps } from './AdditionalEngines';

export function generateSteps(
  algorithmId: string,
  inputArray: number[],
  params: VizParams = {},
): VisualizationStep[] {
  const SORTING = [
    'bubble-sort', 'selection-sort', 'insertion-sort', 'merge-sort', 'quick-sort',
    'heap-sort', 'shell-sort', 'counting-sort', 'radix-sort', 'bucket-sort',
  ];
  const SEARCHING = [
    'linear-search', 'binary-search', 'jump-search', 'interpolation-search',
    'exponential-search', 'ternary-search',
  ];
  const GRAPH = [
    'bfs', 'dfs', 'dijkstra', 'prims', 'kruskal', 'floyd-warshall',
    'topological-sort', 'bellman-ford',
  ];
  const TREE = [
    'bst-insert', 'bst-search', 'inorder', 'preorder', 'postorder', 'avl-rotation',
  ];
  const DP = ['lcs', 'knapsack', 'lis', 'coin-change', 'fibonacci-dp', 'matrix-chain'];
  const BACKTRACKING = ['n-queens', 'sudoku'];
  const GREEDY = ['activity-selection', 'huffman', 'fractional-knapsack'];
  const STRING = ['kmp', 'trie', 'naive-string-match', 'rabin-karp'];

  const target = params.searchTarget ?? params.bstTarget;

  if (SORTING.includes(algorithmId)) return getSortingSteps(algorithmId, inputArray);
  if (SEARCHING.includes(algorithmId)) return getSearchingSteps(algorithmId, inputArray, target);
  if (GRAPH.includes(algorithmId)) return getGraphSteps(algorithmId);
  if (TREE.includes(algorithmId)) return getTreeSteps(algorithmId, inputArray, params.bstTarget ?? target);
  if (DP.includes(algorithmId)) return getDPSteps(algorithmId, inputArray);
  if (BACKTRACKING.includes(algorithmId)) return getBacktrackingSteps(algorithmId);
  if (GREEDY.includes(algorithmId)) return getGreedySteps(algorithmId, inputArray);
  if (STRING.includes(algorithmId)) return getStringSteps(algorithmId, params);

  return getAdditionalSteps(algorithmId, inputArray, params);
}

export function generateRandomArray(size: number = 8, min = 1, max = 50): number[] {
  const set = new Set<number>();
  while (set.size < size) set.add(Math.floor(Math.random() * (max - min + 1)) + min);
  return [...set];
}
