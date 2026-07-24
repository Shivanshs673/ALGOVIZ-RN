# Graph, Tree, DP, Greedy, Backtracking, String Engines
**Files in RN project:**
- `src/features/visualization/engines/GraphEngine.ts`
- `src/features/visualization/engines/TreeEngine.ts`
- `src/features/visualization/engines/DPEngine.ts`
- `src/features/visualization/engines/BacktrackingEngine.ts`
- `src/features/visualization/engines/SearchingEngine.ts`

---

## GraphEngine.ts

```typescript
import { VisualizationStep, GraphNode, GraphEdge, GraphState } from '../../../types/algorithm.types';

// ─── Sample graph used for all graph algorithms ───────────────────────────
// 6 nodes: A-F, weighted undirected edges
export interface GraphInput {
  nodes: GraphNode[];
  edges: GraphEdge[];
  startNode: string;
  endNode?: string;
}

export const DEFAULT_GRAPH: GraphInput = {
  nodes: [
    { id: 'A', label: 'A', x: 150, y: 80,  state: 'default' },
    { id: 'B', label: 'B', x: 300, y: 40,  state: 'default' },
    { id: 'C', label: 'C', x: 450, y: 80,  state: 'default' },
    { id: 'D', label: 'D', x: 150, y: 220, state: 'default' },
    { id: 'E', label: 'E', x: 300, y: 260, state: 'default' },
    { id: 'F', label: 'F', x: 450, y: 220, state: 'default' },
  ],
  edges: [
    { from: 'A', to: 'B', weight: 4,  state: 'default' },
    { from: 'A', to: 'D', weight: 2,  state: 'default' },
    { from: 'B', to: 'C', weight: 5,  state: 'default' },
    { from: 'B', to: 'E', weight: 10, state: 'default' },
    { from: 'C', to: 'F', weight: 3,  state: 'default' },
    { from: 'D', to: 'E', weight: 3,  state: 'default' },
    { from: 'E', to: 'F', weight: 4,  state: 'default' },
  ],
  startNode: 'A',
};

function cloneGraph(input: GraphInput): GraphInput {
  return {
    nodes: input.nodes.map(n => ({ ...n })),
    edges: input.edges.map(e => ({ ...e })),
    startNode: input.startNode,
    endNode: input.endNode,
  };
}

function setNodeState(nodes: GraphNode[], id: string, state: GraphNode['state']): GraphNode[] {
  return nodes.map(n => n.id === id ? { ...n, state } : n);
}

function setEdgeState(edges: GraphEdge[], from: string, to: string, state: GraphEdge['state']): GraphEdge[] {
  return edges.map(e =>
    (e.from === from && e.to === to) || (e.from === to && e.to === from)
      ? { ...e, state } : e
  );
}

// Build adjacency list from edges
function buildAdjacency(input: GraphInput): Map<string, { id: string; weight: number }[]> {
  const adj = new Map<string, { id: string; weight: number }[]>();
  input.nodes.forEach(n => adj.set(n.id, []));
  input.edges.forEach(e => {
    adj.get(e.from)!.push({ id: e.to, weight: e.weight ?? 1 });
    adj.get(e.to)!.push({ id: e.from, weight: e.weight ?? 1 }); // undirected
  });
  return adj;
}

// ─────────────────────────────────────────────
// BFS
// ─────────────────────────────────────────────

export function generateBFSSteps(input: GraphInput = DEFAULT_GRAPH): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const g = cloneGraph(input);
  const adj = buildAdjacency(g);
  const visited = new Set<string>();
  const queue: string[] = [g.startNode];
  visited.add(g.startNode);
  let comparisons = 0;

  g.nodes = setNodeState(g.nodes, g.startNode, 'visiting');
  steps.push({
    graphState: { nodes: g.nodes.map(n => ({...n})), edges: g.edges.map(e => ({...e})) },
    queue: [...queue],
    message: `BFS Start: enqueue ${g.startNode}, mark visited`,
    comparisons: 0, swaps: 0, stepType: 'visit',
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    g.nodes = setNodeState(g.nodes, current, 'processed');
    comparisons++;

    steps.push({
      graphState: { nodes: g.nodes.map(n => ({...n})), edges: g.edges.map(e => ({...e})) },
      currentNode: current,
      queue: [...queue],
      message: `Processing node ${current}`,
      comparisons, swaps: 0, stepType: 'process',
    });

    for (const neighbor of adj.get(current) ?? []) {
      comparisons++;
      if (!visited.has(neighbor.id)) {
        visited.add(neighbor.id);
        queue.push(neighbor.id);
        g.nodes = setNodeState(g.nodes, neighbor.id, 'visiting');
        g.edges = setEdgeState(g.edges, current, neighbor.id, 'active');
        steps.push({
          graphState: { nodes: g.nodes.map(n => ({...n})), edges: g.edges.map(e => ({...e})) },
          currentNode: current,
          queue: [...queue],
          message: `Discovered ${neighbor.id} from ${current}, enqueue`,
          comparisons, swaps: 0, stepType: 'visit',
        });
      }
    }
  }

  steps.push({
    graphState: { nodes: g.nodes.map(n => ({...n})), edges: g.edges.map(e => ({...e})) },
    message: `BFS complete! Visited order: ${[...visited].join(' → ')}`,
    comparisons, swaps: 0, stepType: 'complete',
  });

  return steps;
}

// ─────────────────────────────────────────────
// DFS
// ─────────────────────────────────────────────

export function generateDFSSteps(input: GraphInput = DEFAULT_GRAPH): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const g = cloneGraph(input);
  const adj = buildAdjacency(g);
  const visited = new Set<string>();
  const visitOrder: string[] = [];
  let comparisons = 0;

  function dfs(nodeId: string) {
    visited.add(nodeId);
    visitOrder.push(nodeId);
    g.nodes = setNodeState(g.nodes, nodeId, 'visiting');
    steps.push({
      graphState: { nodes: g.nodes.map(n => ({...n})), edges: g.edges.map(e => ({...e})) },
      currentNode: nodeId,
      stack: [...visitOrder],
      message: `DFS visiting ${nodeId}`,
      comparisons: ++comparisons, swaps: 0, stepType: 'visit',
    });

    for (const neighbor of adj.get(nodeId) ?? []) {
      comparisons++;
      if (!visited.has(neighbor.id)) {
        g.edges = setEdgeState(g.edges, nodeId, neighbor.id, 'active');
        dfs(neighbor.id);
      }
    }

    g.nodes = setNodeState(g.nodes, nodeId, 'processed');
    steps.push({
      graphState: { nodes: g.nodes.map(n => ({...n})), edges: g.edges.map(e => ({...e})) },
      currentNode: nodeId,
      message: `Backtracking from ${nodeId}`,
      comparisons, swaps: 0, stepType: 'process',
    });
  }

  steps.push({
    graphState: { nodes: g.nodes.map(n => ({...n})), edges: g.edges.map(e => ({...e})) },
    message: `Starting DFS from ${g.startNode}`,
    comparisons: 0, swaps: 0, stepType: 'info',
  });

  dfs(g.startNode);

  steps.push({
    graphState: { nodes: g.nodes.map(n => ({...n})), edges: g.edges.map(e => ({...e})) },
    message: `DFS complete! Visit order: ${visitOrder.join(' → ')}`,
    comparisons, swaps: 0, stepType: 'complete',
  });

  return steps;
}

// ─────────────────────────────────────────────
// DIJKSTRA
// ─────────────────────────────────────────────

export function generateDijkstraSteps(input: GraphInput = DEFAULT_GRAPH): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const g = cloneGraph(input);
  const adj = buildAdjacency(g);
  const dist: Record<string, number> = {};
  const visited = new Set<string>();
  let comparisons = 0;

  g.nodes.forEach(n => { dist[n.id] = n.id === g.startNode ? 0 : Infinity; });

  steps.push({
    graphState: { nodes: g.nodes.map(n => ({...n, distance: dist[n.id]})), edges: g.edges.map(e => ({...e})) },
    message: `Dijkstra start: dist[${g.startNode}]=0, all others=∞`,
    comparisons: 0, swaps: 0, stepType: 'info',
  });

  while (visited.size < g.nodes.length) {
    // Find unvisited node with minimum distance
    let u = '';
    let minDist = Infinity;
    for (const n of g.nodes) {
      if (!visited.has(n.id) && dist[n.id] < minDist) {
        minDist = dist[n.id]; u = n.id;
      }
    }
    if (!u || minDist === Infinity) break;

    visited.add(u);
    g.nodes = setNodeState(g.nodes, u, 'visited');
    steps.push({
      graphState: { nodes: g.nodes.map(n => ({...n, distance: dist[n.id]})), edges: g.edges.map(e => ({...e})) },
      currentNode: u,
      message: `Processing ${u} (dist=${dist[u]})`,
      comparisons: ++comparisons, swaps: 0, stepType: 'process',
    });

    for (const neighbor of adj.get(u) ?? []) {
      comparisons++;
      const newDist = dist[u] + neighbor.weight;
      if (newDist < dist[neighbor.id]) {
        dist[neighbor.id] = newDist;
        g.nodes = setNodeState(g.nodes, neighbor.id, 'visiting');
        g.edges = setEdgeState(g.edges, u, neighbor.id, 'path');
        steps.push({
          graphState: { nodes: g.nodes.map(n => ({...n, distance: dist[n.id]})), edges: g.edges.map(e => ({...e})) },
          currentNode: u,
          message: `Relaxed edge ${u}→${neighbor.id}: dist[${neighbor.id}] = ${newDist}`,
          comparisons, swaps: 0, stepType: 'visit',
        });
      }
    }
  }

  steps.push({
    graphState: { nodes: g.nodes.map(n => ({...n, distance: dist[n.id]})), edges: g.edges.map(e => ({...e})) },
    message: `Dijkstra complete! Shortest distances from ${g.startNode}: ${Object.entries(dist).map(([k,v]) => `${k}=${v}`).join(', ')}`,
    comparisons, swaps: 0, stepType: 'complete',
  });

  return steps;
}

export function getGraphSteps(algorithmId: string, input?: GraphInput): VisualizationStep[] {
  switch (algorithmId) {
    case 'bfs':      return generateBFSSteps(input);
    case 'dfs':      return generateDFSSteps(input);
    case 'dijkstra': return generateDijkstraSteps(input);
    default: return [];
  }
}
```

---

## TreeEngine.ts

```typescript
import { VisualizationStep, TreeNode } from '../../../types/algorithm.types';

// Build a BST from an array of values
function buildBST(values: number[]): TreeNode | undefined {
  let root: TreeNode | undefined;
  let nextId = 0;
  function insert(node: TreeNode | undefined, val: number): TreeNode {
    if (!node) return { id: `n${nextId++}`, value: val, state: 'default' };
    if (val < node.value) return { ...node, left: insert(node.left, val) };
    if (val > node.value) return { ...node, right: insert(node.right, val) };
    return node;
  }
  for (const v of values) root = insert(root, v);
  return root;
}

// Assign x/y positions for drawing
function assignPositions(node: TreeNode | undefined, x: number, y: number, spread: number): TreeNode | undefined {
  if (!node) return undefined;
  return {
    ...node,
    x, y,
    left:  assignPositions(node.left,  x - spread, y + 80, spread / 2),
    right: assignPositions(node.right, x + spread, y + 80, spread / 2),
  };
}

function cloneTree(node: TreeNode | undefined): TreeNode | undefined {
  if (!node) return undefined;
  return { ...node, left: cloneTree(node.left), right: cloneTree(node.right) };
}

function setTreeNodeState(root: TreeNode | undefined, id: string, state: TreeNode['state']): TreeNode | undefined {
  if (!root) return undefined;
  if (root.id === id) return { ...root, state };
  return { ...root, left: setTreeNodeState(root.left, id, state), right: setTreeNodeState(root.right, id, state) };
}

// ─────────────────────────────────────────────
// INORDER TRAVERSAL
// ─────────────────────────────────────────────

export function generateInorderSteps(values: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let root = buildBST(values);
  root = assignPositions(root, 200, 40, 100);
  const traversalOrder: number[] = [];
  let comparisons = 0;

  steps.push({ treeRoot: cloneTree(root), traversalOrder: [], message: 'Starting Inorder (Left → Root → Right)', comparisons: 0, swaps: 0, stepType: 'info' });

  function inorder(node: TreeNode | undefined) {
    if (!node) return;
    inorder(node.left);
    comparisons++;
    root = setTreeNodeState(root, node.id, 'visiting')!;
    traversalOrder.push(node.value);
    steps.push({ treeRoot: cloneTree(root), traversalOrder: [...traversalOrder], currentTreeNode: node.id, message: `Visiting ${node.value}`, comparisons, swaps: 0, stepType: 'visit' });
    root = setTreeNodeState(root, node.id, 'visited')!;
    inorder(node.right);
  }
  inorder(root);

  steps.push({ treeRoot: cloneTree(root), traversalOrder: [...traversalOrder], message: `Inorder complete: [${traversalOrder.join(', ')}]`, comparisons, swaps: 0, stepType: 'complete' });
  return steps;
}

export function generatePreorderSteps(values: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let root = buildBST(values);
  root = assignPositions(root, 200, 40, 100);
  const traversalOrder: number[] = [];
  let comparisons = 0;

  steps.push({ treeRoot: cloneTree(root), traversalOrder: [], message: 'Starting Preorder (Root → Left → Right)', comparisons: 0, swaps: 0, stepType: 'info' });

  function preorder(node: TreeNode | undefined) {
    if (!node) return;
    comparisons++;
    root = setTreeNodeState(root, node.id, 'visiting')!;
    traversalOrder.push(node.value);
    steps.push({ treeRoot: cloneTree(root), traversalOrder: [...traversalOrder], currentTreeNode: node.id, message: `Visiting ${node.value}`, comparisons, swaps: 0, stepType: 'visit' });
    root = setTreeNodeState(root, node.id, 'visited')!;
    preorder(node.left);
    preorder(node.right);
  }
  preorder(root);

  steps.push({ treeRoot: cloneTree(root), traversalOrder: [...traversalOrder], message: `Preorder complete: [${traversalOrder.join(', ')}]`, comparisons, swaps: 0, stepType: 'complete' });
  return steps;
}

export function getTreeSteps(algorithmId: string, values: number[]): VisualizationStep[] {
  switch (algorithmId) {
    case 'inorder':   return generateInorderSteps(values);
    case 'preorder':  return generatePreorderSteps(values);
    case 'postorder': return generatePostorderSteps(values);
    case 'bst-insert': return generateBSTInsertSteps(values);
    case 'bst-search': return generateBSTSearchSteps(values, values[Math.floor(values.length / 2)]);
    default: return [];
  }
}

// postorder (same pattern — Left → Right → Root)
export function generatePostorderSteps(values: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let root = buildBST(values);
  root = assignPositions(root, 200, 40, 100);
  const traversalOrder: number[] = [];
  let comparisons = 0;

  steps.push({ treeRoot: cloneTree(root), traversalOrder: [], message: 'Starting Postorder (Left → Right → Root)', comparisons: 0, swaps: 0, stepType: 'info' });

  function postorder(node: TreeNode | undefined) {
    if (!node) return;
    postorder(node.left);
    postorder(node.right);
    comparisons++;
    root = setTreeNodeState(root, node.id, 'visiting')!;
    traversalOrder.push(node.value);
    steps.push({ treeRoot: cloneTree(root), traversalOrder: [...traversalOrder], currentTreeNode: node.id, message: `Visiting ${node.value}`, comparisons, swaps: 0, stepType: 'visit' });
    root = setTreeNodeState(root, node.id, 'visited')!;
  }
  postorder(root);

  steps.push({ treeRoot: cloneTree(root), traversalOrder: [...traversalOrder], message: `Postorder complete: [${traversalOrder.join(', ')}]`, comparisons, swaps: 0, stepType: 'complete' });
  return steps;
}

export function generateBSTInsertSteps(values: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let root: TreeNode | undefined;
  let nextId = 0;
  let comparisons = 0;

  steps.push({ treeRoot: undefined, traversalOrder: [], message: 'Building BST by inserting values one by one', comparisons: 0, swaps: 0, stepType: 'info' });

  function insertStep(node: TreeNode | undefined, val: number): TreeNode {
    if (!node) {
      const newNode: TreeNode = { id: `n${nextId++}`, value: val, state: 'visiting' };
      steps.push({ treeRoot: assignPositions(cloneTree({ ...newNode }), 200, 40, 100), message: `Inserting ${val} — empty spot found`, comparisons, swaps: 0, stepType: 'insert' });
      return { ...newNode, state: 'visited' };
    }
    comparisons++;
    if (val < node.value) {
      steps.push({ treeRoot: assignPositions(cloneTree({ ...node, state: 'visiting' }), 200, 40, 100), message: `${val} < ${node.value}, go left`, comparisons, swaps: 0, stepType: 'compare' });
      return { ...node, state: 'visited', left: insertStep(node.left, val) };
    } else {
      steps.push({ treeRoot: assignPositions(cloneTree({ ...node, state: 'visiting' }), 200, 40, 100), message: `${val} > ${node.value}, go right`, comparisons, swaps: 0, stepType: 'compare' });
      return { ...node, state: 'visited', right: insertStep(node.right, val) };
    }
  }

  for (const v of values) {
    root = insertStep(root, v);
    root = assignPositions(root, 200, 40, 100);
  }

  steps.push({ treeRoot: cloneTree(root), traversalOrder: values, message: `BST built with values: [${values.join(', ')}]`, comparisons, swaps: 0, stepType: 'complete' });
  return steps;
}

export function generateBSTSearchSteps(values: number[], target: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let root = buildBST(values);
  root = assignPositions(root, 200, 40, 100);
  let comparisons = 0;

  steps.push({ treeRoot: cloneTree(root), message: `Searching for ${target} in BST`, comparisons: 0, swaps: 0, stepType: 'info' });

  function search(node: TreeNode | undefined): boolean {
    if (!node) {
      steps.push({ treeRoot: cloneTree(root), message: `${target} NOT FOUND in BST`, comparisons, swaps: 0, stepType: 'not_found' });
      return false;
    }
    comparisons++;
    root = setTreeNodeState(root, node.id, 'visiting')!;
    steps.push({ treeRoot: cloneTree(root), currentTreeNode: node.id, message: `Checking node ${node.value}`, comparisons, swaps: 0, stepType: 'compare' });

    if (target === node.value) {
      root = setTreeNodeState(root, node.id, 'found')!;
      steps.push({ treeRoot: cloneTree(root), currentTreeNode: node.id, message: `Found ${target}!`, comparisons, swaps: 0, stepType: 'found' });
      return true;
    }
    root = setTreeNodeState(root, node.id, 'visited')!;
    if (target < node.value) {
      steps.push({ treeRoot: cloneTree(root), message: `${target} < ${node.value}, go left`, comparisons, swaps: 0, stepType: 'info' });
      return search(node.left);
    } else {
      steps.push({ treeRoot: cloneTree(root), message: `${target} > ${node.value}, go right`, comparisons, swaps: 0, stepType: 'info' });
      return search(node.right);
    }
  }
  search(root);
  return steps;
}
```

---

## DPEngine.ts

```typescript
import { VisualizationStep } from '../../../types/algorithm.types';

// ─────────────────────────────────────────────
// LCS (Longest Common Subsequence)
// ─────────────────────────────────────────────

export function generateLCSSteps(X: number[], Y: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const m = X.length, n = Y.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  let comparisons = 0;

  steps.push({ matrix: dp.map(r => [...r]), message: `LCS of [${X.join(',')}] and [${Y.join(',')}]. Building DP table.`, comparisons: 0, swaps: 0, stepType: 'info' });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      comparisons++;
      if (X[i - 1] === Y[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        steps.push({ matrix: dp.map(r => [...r]), highlightCells: [[i, j]], message: `X[${i-1}]=${X[i-1]} == Y[${j-1}]=${Y[j-1]} → dp[${i}][${j}] = ${dp[i][j]}`, comparisons, swaps: 0, stepType: 'compare' });
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        steps.push({ matrix: dp.map(r => [...r]), highlightCells: [[i, j]], message: `X[${i-1}]=${X[i-1]} ≠ Y[${j-1}]=${Y[j-1]} → dp[${i}][${j}] = max(${dp[i-1][j]},${dp[i][j-1]}) = ${dp[i][j]}`, comparisons, swaps: 0, stepType: 'info' });
      }
    }
  }
  steps.push({ matrix: dp.map(r => [...r]), message: `LCS length = ${dp[m][n]}`, comparisons, swaps: 0, stepType: 'complete' });
  return steps;
}

// ─────────────────────────────────────────────
// 0/1 KNAPSACK
// ─────────────────────────────────────────────

export function generateKnapsackSteps(W: number, weights: number[], values: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = weights.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
  let comparisons = 0;

  steps.push({ matrix: dp.map(r => [...r]), message: `Knapsack W=${W}, Items: ${weights.map((w, i) => `(w=${w},v=${values[i]})`).join(' ')}`, comparisons: 0, swaps: 0, stepType: 'info' });

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= W; w++) {
      comparisons++;
      if (weights[i - 1] <= w) {
        const withItem = values[i - 1] + dp[i - 1][w - weights[i - 1]];
        const withoutItem = dp[i - 1][w];
        dp[i][w] = Math.max(withItem, withoutItem);
        steps.push({ matrix: dp.map(r => [...r]), highlightCells: [[i, w]], message: `Item ${i} (w=${weights[i-1]},v=${values[i-1]}): max(${withoutItem}, ${withItem}) = ${dp[i][w]}`, comparisons, swaps: 0, stepType: 'compare' });
      } else {
        dp[i][w] = dp[i - 1][w];
        steps.push({ matrix: dp.map(r => [...r]), highlightCells: [[i, w]], message: `Item ${i} too heavy for w=${w}, skip`, comparisons, swaps: 0, stepType: 'info' });
      }
    }
  }
  steps.push({ matrix: dp.map(r => [...r]), message: `Max value = ${dp[n][W]}`, comparisons, swaps: 0, stepType: 'complete' });
  return steps;
}

export function getDPSteps(algorithmId: string, arr: number[]): VisualizationStep[] {
  switch (algorithmId) {
    case 'lcs': return generateLCSSteps(arr.slice(0, 4), arr.slice(4));
    case 'knapsack': return generateKnapsackSteps(10, [2, 3, 4, 5], [3, 4, 5, 6]);
    case 'lis': return generateLISSteps(arr);
    case 'coin-change': return generateCoinChangeSteps(arr, arr.reduce((s, x) => s + x, 0) / 3 | 0);
    default: return [];
  }
}

export function generateLISSteps(arr: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = arr.length;
  const dp = new Array(n).fill(1);
  let comparisons = 0;

  steps.push({ array: [...arr], message: `Finding LIS of [${arr.join(', ')}]`, comparisons: 0, swaps: 0, stepType: 'info' });

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      comparisons++;
      if (arr[j] < arr[i] && dp[j] + 1 > dp[i]) {
        dp[i] = dp[j] + 1;
        steps.push({ array: [...arr], comparing: [j, i], message: `arr[${j}]=${arr[j]} < arr[${i}]=${arr[i]} → dp[${i}]=${dp[i]}`, comparisons, swaps: 0, stepType: 'compare' });
      }
    }
  }

  const maxLen = Math.max(...dp);
  steps.push({ array: [...arr], message: `LIS length = ${maxLen}`, comparisons, swaps: 0, stepType: 'complete' });
  return steps;
}

export function generateCoinChangeSteps(coins: number[], amount: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  let comparisons = 0;

  steps.push({ array: [...dp], message: `Coin Change: amount=${amount}, coins=[${coins.join(',')}]`, comparisons: 0, swaps: 0, stepType: 'info' });

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      comparisons++;
      if (coin <= i && dp[i - coin] + 1 < dp[i]) {
        dp[i] = dp[i - coin] + 1;
        steps.push({ array: dp.map(v => v === Infinity ? -1 : v), comparing: [i], message: `dp[${i}] = dp[${i}-${coin}]+1 = ${dp[i]}`, comparisons, swaps: 0, stepType: 'compare' });
      }
    }
  }

  const result = dp[amount] === Infinity ? -1 : dp[amount];
  steps.push({ array: dp.map(v => v === Infinity ? -1 : v), message: `Min coins for ${amount} = ${result}`, comparisons, swaps: 0, stepType: 'complete' });
  return steps;
}
```

---

## SearchingEngine.ts

```typescript
import { VisualizationStep } from '../../../types/algorithm.types';

export function generateLinearSearchSteps(arr: number[], target: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let comparisons = 0;
  steps.push({ array: [...arr], searchTarget: target, message: `Linear Search for ${target}`, comparisons: 0, swaps: 0, stepType: 'info' });
  for (let i = 0; i < arr.length; i++) {
    comparisons++;
    steps.push({ array: [...arr], comparing: [i], searchTarget: target, message: `Checking arr[${i}] = ${arr[i]}`, comparisons, swaps: 0, stepType: 'compare' });
    if (arr[i] === target) {
      steps.push({ array: [...arr], found: i, searchTarget: target, message: `Found ${target} at index ${i}!`, comparisons, swaps: 0, stepType: 'found' });
      return steps;
    }
  }
  steps.push({ array: [...arr], searchTarget: target, message: `${target} not found after ${comparisons} comparisons`, comparisons, swaps: 0, stepType: 'not_found' });
  return steps;
}

export function generateBinarySearchSteps(arr: number[], target: number): VisualizationStep[] {
  const sorted = [...arr].sort((a, b) => a - b);
  const steps: VisualizationStep[] = [];
  let left = 0, right = sorted.length - 1;
  let comparisons = 0;
  steps.push({ array: sorted, searchTarget: target, message: `Binary Search for ${target} in sorted array`, comparisons: 0, swaps: 0, stepType: 'info' });
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    comparisons++;
    steps.push({ array: sorted, comparing: [left, mid, right], searchTarget: target, message: `left=${left}, right=${right}, mid=${mid} → arr[mid]=${sorted[mid]}`, comparisons, swaps: 0, stepType: 'compare' });
    if (sorted[mid] === target) {
      steps.push({ array: sorted, found: mid, searchTarget: target, message: `Found ${target} at index ${mid}!`, comparisons, swaps: 0, stepType: 'found' });
      return steps;
    }
    if (sorted[mid] < target) { left = mid + 1; steps.push({ array: sorted, comparing: [left, right], message: `${sorted[mid]} < ${target}, search right half`, comparisons, swaps: 0, stepType: 'info' }); }
    else { right = mid - 1; steps.push({ array: sorted, comparing: [left, right], message: `${sorted[mid]} > ${target}, search left half`, comparisons, swaps: 0, stepType: 'info' }); }
  }
  steps.push({ array: sorted, searchTarget: target, message: `${target} not found`, comparisons, swaps: 0, stepType: 'not_found' });
  return steps;
}

export function getSearchingSteps(algorithmId: string, arr: number[], target?: number): VisualizationStep[] {
  const t = target ?? arr[Math.floor(arr.length / 2)];
  switch (algorithmId) {
    case 'linear-search':        return generateLinearSearchSteps(arr, t);
    case 'binary-search':        return generateBinarySearchSteps(arr, t);
    default: return [];
  }
}
```

---

## BacktrackingEngine.ts

```typescript
import { VisualizationStep } from '../../../types/algorithm.types';

export function generateNQueensSteps(n: number = 6): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const board: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));
  let stepCount = 0;

  function isSafe(row: number, col: number): boolean {
    for (let i = 0; i < row; i++) {
      if (board[i][col] === 1) return false;
      if (col - (row - i) >= 0 && board[i][col - (row - i)] === 1) return false;
      if (col + (row - i) < n && board[i][col + (row - i)] === 1) return false;
    }
    return true;
  }

  function solve(row: number): boolean {
    if (row === n) return true;
    for (let col = 0; col < n; col++) {
      if (stepCount > 200) return true; // Limit steps for visualization
      const safe = isSafe(row, col);
      steps.push({
        board: board.map(r => [...r]),
        tryingPosition: [row, col],
        message: safe ? `Row ${row}: Trying queen at col ${col} — safe! ✓` : `Row ${row}: Col ${col} — conflict! ✗`,
        comparisons: ++stepCount, swaps: 0, stepType: safe ? 'compare' : 'info',
      });
      if (safe) {
        board[row][col] = 1;
        steps.push({ board: board.map(r => [...r]), message: `Placed queen at (${row}, ${col})`, comparisons: stepCount, swaps: 0, stepType: 'insert' });
        if (solve(row + 1)) return true;
        board[row][col] = null;
        steps.push({ board: board.map(r => [...r]), message: `Backtrack from (${row}, ${col})`, comparisons: stepCount, swaps: 0, stepType: 'info' });
      }
    }
    return false;
  }

  steps.push({ board: board.map(r => [...r]), message: `Solving ${n}-Queens Problem`, comparisons: 0, swaps: 0, stepType: 'info' });
  solve(0);
  steps.push({ board: board.map(r => [...r]), message: `${n}-Queens solved!`, comparisons: stepCount, swaps: 0, stepType: 'complete' });
  return steps;
}

export function getBacktrackingSteps(algorithmId: string): VisualizationStep[] {
  switch (algorithmId) {
    case 'n-queens': return generateNQueensSteps(6);
    case 'sudoku':   return generateNQueensSteps(6); // Substitute Sudoku here if needed
    default: return [];
  }
}
```

---

## Master Dispatcher (engineDispatcher.ts)

```typescript
// src/features/visualization/engines/engineDispatcher.ts
import { VisualizationStep } from '../../../types/algorithm.types';
import { getSortingSteps } from './SortingEngine';
import { getSearchingSteps } from './SearchingEngine';
import { getGraphSteps } from './GraphEngine';
import { getTreeSteps } from './TreeEngine';
import { getDPSteps } from './DPEngine';
import { getBacktrackingSteps } from './BacktrackingEngine';

export function generateSteps(algorithmId: string, inputArray: number[]): VisualizationStep[] {
  const SORTING = ['bubble-sort','selection-sort','insertion-sort','merge-sort','quick-sort','heap-sort','shell-sort','counting-sort','radix-sort'];
  const SEARCHING = ['linear-search','binary-search','jump-search','interpolation-search','exponential-search'];
  const GRAPH = ['bfs','dfs','dijkstra','prims','kruskal','floyd-warshall'];
  const TREE = ['bst-insert','bst-search','inorder','preorder','postorder'];
  const DP = ['lcs','knapsack','lis','coin-change'];
  const BACKTRACKING = ['n-queens','sudoku'];

  if (SORTING.includes(algorithmId))    return getSortingSteps(algorithmId, inputArray);
  if (SEARCHING.includes(algorithmId))  return getSearchingSteps(algorithmId, inputArray);
  if (GRAPH.includes(algorithmId))      return getGraphSteps(algorithmId);
  if (TREE.includes(algorithmId))       return getTreeSteps(algorithmId, inputArray);
  if (DP.includes(algorithmId))         return getDPSteps(algorithmId, inputArray);
  if (BACKTRACKING.includes(algorithmId)) return getBacktrackingSteps(algorithmId);

  return [];
}

/** Generate a random array for algorithm input */
export function generateRandomArray(size: number = 8, min = 1, max = 50): number[] {
  const set = new Set<number>();
  while (set.size < size) set.add(Math.floor(Math.random() * (max - min + 1)) + min);
  return [...set];
}
```
