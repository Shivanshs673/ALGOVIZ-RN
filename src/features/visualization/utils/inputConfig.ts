import { AlgorithmCategory } from '../../../types/algorithm.types';

export type InputFieldType = 'array' | 'searchTarget' | 'bstTarget' | 'kmpText' | 'kmpPattern' | 'trieWords';

export interface AlgorithmInputConfig {
  fields: InputFieldType[];
  expandableViz?: boolean;
  vizType?: 'tree' | 'trie' | 'graph' | 'matrix' | 'board';
}

const SEARCHING = new Set([
  'linear-search', 'binary-search', 'jump-search', 'interpolation-search', 'exponential-search',
]);
const STRING = new Set(['kmp', 'naive-string-match', 'rabin-karp']);
const TREE = new Set(['bst-insert', 'bst-search', 'inorder', 'preorder', 'postorder', 'avl-rotation']);
const GRAPH = new Set(['bfs', 'dfs', 'dijkstra', 'prims', 'kruskal', 'floyd-warshall', 'topological-sort', 'bellman-ford']);
const DP = new Set(['lcs', 'knapsack', 'lis', 'coin-change', 'fibonacci-dp', 'matrix-chain']);
const BACKTRACKING = new Set(['n-queens', 'sudoku']);
const GREEDY = new Set(['activity-selection', 'huffman', 'fractional-knapsack']);

export function getAlgorithmInputConfig(algorithmId: string, category: AlgorithmCategory): AlgorithmInputConfig {
  if (algorithmId === 'trie') {
    return { fields: ['trieWords'], expandableViz: true, vizType: 'trie' };
  }
  if (algorithmId === 'kmp') {
    return { fields: ['kmpText', 'kmpPattern'], expandableViz: false };
  }
  if (algorithmId === 'naive-string-match' || algorithmId === 'rabin-karp') {
    return { fields: ['kmpText', 'kmpPattern'] };
  }
  if (SEARCHING.has(algorithmId)) {
    return { fields: ['array', 'searchTarget'] };
  }
  if (algorithmId === 'bst-search') {
    return { fields: ['array', 'bstTarget'], expandableViz: true, vizType: 'tree' };
  }
  if (TREE.has(algorithmId)) {
    return { fields: ['array'], expandableViz: true, vizType: 'tree' };
  }
  if (GRAPH.has(algorithmId)) {
    return { fields: [], expandableViz: true, vizType: 'graph' };
  }
  if (DP.has(algorithmId)) {
    return { fields: ['array'], expandableViz: true, vizType: 'matrix' };
  }
  if (BACKTRACKING.has(algorithmId)) {
    return { fields: [], expandableViz: true, vizType: 'board' };
  }
  if (GREEDY.has(algorithmId)) {
    return { fields: algorithmId === 'huffman' ? ['array'] : [] };
  }
  if (category === 'SORTING' || category === 'DIVIDE_AND_CONQUER') {
    return { fields: ['array'] };
  }
  return { fields: ['array'] };
}
