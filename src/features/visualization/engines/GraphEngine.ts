import { VisualizationStep, GraphNode, GraphEdge } from '../../../types/algorithm.types';

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

function buildAdjacency(input: GraphInput): Map<string, { id: string; weight: number }[]> {
  const adj = new Map<string, { id: string; weight: number }[]>();
  input.nodes.forEach(n => adj.set(n.id, []));
  input.edges.forEach(e => {
    adj.get(e.from)!.push({ id: e.to, weight: e.weight ?? 1 });
    adj.get(e.to)!.push({ id: e.from, weight: e.weight ?? 1 });
  });
  return adj;
}

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

export function generatePrimSteps(input: GraphInput = DEFAULT_GRAPH): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const g = cloneGraph(input);
  const adj = buildAdjacency(g);
  const inMST = new Set<string>([g.startNode]);
  let comparisons = 0;
  let mstWeight = 0;

  g.nodes = setNodeState(g.nodes, g.startNode, 'visited');
  steps.push({
    graphState: { nodes: g.nodes.map(n => ({ ...n })), edges: g.edges.map(e => ({ ...e })) },
    message: `Prim's MST starting from ${g.startNode}`,
    comparisons: 0,
    swaps: 0,
    stepType: 'info',
  });

  while (inMST.size < g.nodes.length) {
    let bestFrom = '';
    let bestTo = '';
    let bestWeight = Infinity;

    for (const u of inMST) {
      for (const neigh of adj.get(u) ?? []) {
        comparisons++;
        if (!inMST.has(neigh.id) && neigh.weight < bestWeight) {
          bestWeight = neigh.weight;
          bestFrom = u;
          bestTo = neigh.id;
        }
      }
    }

    if (!bestTo || bestWeight === Infinity) break;

    inMST.add(bestTo);
    mstWeight += bestWeight;
    g.nodes = setNodeState(g.nodes, bestTo, 'visited');
    g.edges = setEdgeState(g.edges, bestFrom, bestTo, 'inMST');
    steps.push({
      graphState: { nodes: g.nodes.map(n => ({ ...n })), edges: g.edges.map(e => ({ ...e })) },
      currentNode: bestTo,
      message: `Add edge ${bestFrom}—${bestTo} (w=${bestWeight}) to MST`,
      comparisons,
      swaps: 0,
      stepType: 'visit',
    });
  }

  steps.push({
    graphState: { nodes: g.nodes.map(n => ({ ...n })), edges: g.edges.map(e => ({ ...e })) },
    message: `Prim's complete! MST weight = ${mstWeight}`,
    comparisons,
    swaps: 0,
    stepType: 'complete',
  });
  return steps;
}

export function generateKruskalSteps(input: GraphInput = DEFAULT_GRAPH): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const g = cloneGraph(input);
  const parent: Record<string, string> = {};
  g.nodes.forEach((n) => {
    parent[n.id] = n.id;
  });

  function find(x: string): string {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  function union(a: string, b: string) {
    parent[find(a)] = find(b);
  }

  const sortedEdges = [...g.edges].sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));
  let comparisons = 0;
  let mstWeight = 0;
  let edgesAdded = 0;

  steps.push({
    graphState: { nodes: g.nodes.map(n => ({ ...n })), edges: g.edges.map(e => ({ ...e })) },
    message: `Kruskal's MST — sort edges by weight`,
    comparisons: 0,
    swaps: 0,
    stepType: 'info',
  });

  for (const edge of sortedEdges) {
    comparisons++;
    const uRoot = find(edge.from);
    const vRoot = find(edge.to);
    steps.push({
      graphState: { nodes: g.nodes.map(n => ({ ...n })), edges: setEdgeState(g.edges, edge.from, edge.to, 'active') },
      message: `Consider ${edge.from}—${edge.to} (w=${edge.weight})`,
      comparisons,
      swaps: 0,
      stepType: 'compare',
    });

    if (uRoot !== vRoot) {
      union(edge.from, edge.to);
      g.edges = setEdgeState(g.edges, edge.from, edge.to, 'inMST');
      g.nodes = setNodeState(g.nodes, edge.from, 'visited');
      g.nodes = setNodeState(g.nodes, edge.to, 'visited');
      mstWeight += edge.weight ?? 0;
      edgesAdded++;
      steps.push({
        graphState: { nodes: g.nodes.map(n => ({ ...n })), edges: g.edges.map(e => ({ ...e })) },
        message: `Accept edge ${edge.from}—${edge.to} (no cycle)`,
        comparisons,
        swaps: 0,
        stepType: 'visit',
      });
      if (edgesAdded === g.nodes.length - 1) break;
    } else {
      steps.push({
        graphState: { nodes: g.nodes.map(n => ({ ...n })), edges: g.edges.map(e => ({ ...e })) },
        message: `Reject ${edge.from}—${edge.to} — would form a cycle`,
        comparisons,
        swaps: 0,
        stepType: 'info',
      });
    }
  }

  steps.push({
    graphState: { nodes: g.nodes.map(n => ({ ...n })), edges: g.edges.map(e => ({ ...e })) },
    message: `Kruskal's complete! MST weight = ${mstWeight}`,
    comparisons,
    swaps: 0,
    stepType: 'complete',
  });
  return steps;
}

export function generateFloydWarshallSteps(input: GraphInput = DEFAULT_GRAPH): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const g = cloneGraph(input);
  const ids = g.nodes.map((n) => n.id);
  const n = ids.length;
  const dist: number[][] = Array.from({ length: n }, () => Array(n).fill(Infinity));
  let comparisons = 0;

  for (let i = 0; i < n; i++) dist[i][i] = 0;
  for (const e of g.edges) {
    const i = ids.indexOf(e.from);
    const j = ids.indexOf(e.to);
    const w = e.weight ?? 1;
    dist[i][j] = w;
    dist[j][i] = w;
  }

  steps.push({
    graphState: { nodes: g.nodes.map(n => ({ ...n })), edges: g.edges.map(e => ({ ...e })) },
    matrix: dist.map((row) => row.map((v) => (v === Infinity ? -1 : v))),
    message: 'Floyd-Warshall: initialize distance matrix (−1 = ∞)',
    comparisons: 0,
    swaps: 0,
    stepType: 'info',
  });

  for (let k = 0; k < n; k++) {
    g.nodes = setNodeState(
      g.nodes.map((node) => ({ ...node, state: 'default' as const })),
      ids[k],
      'visiting',
    );
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        comparisons++;
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
          steps.push({
            graphState: { nodes: g.nodes.map(n => ({ ...n })), edges: g.edges.map(e => ({ ...e })) },
            matrix: dist.map((row) => row.map((v) => (v === Infinity ? -1 : v))),
            highlightCells: [
              [i, j],
              [i, k],
              [k, j],
            ],
            message: `Via ${ids[k]}: dist[${ids[i]}][${ids[j]}] = ${dist[i][j]}`,
            comparisons,
            swaps: 0,
            stepType: 'process',
          });
        }
      }
    }
  }

  steps.push({
    graphState: { nodes: g.nodes.map(n => ({ ...n })), edges: g.edges.map(e => ({ ...e })) },
    matrix: dist.map((row) => row.map((v) => (v === Infinity ? -1 : v))),
    message: 'Floyd-Warshall complete — all-pairs shortest paths ready',
    comparisons,
    swaps: 0,
    stepType: 'complete',
  });
  return steps;
}

export function getGraphSteps(algorithmId: string, input?: GraphInput): VisualizationStep[] {
  switch (algorithmId) {
    case 'bfs':
      return generateBFSSteps(input);
    case 'dfs':
      return generateDFSSteps(input);
    case 'dijkstra':
      return generateDijkstraSteps(input);
    case 'prims':
      return generatePrimSteps(input);
    case 'kruskal':
      return generateKruskalSteps(input);
    case 'floyd-warshall':
      return generateFloydWarshallSteps(input);
    case 'topological-sort':
      return generateDFSSteps(input);
    case 'bellman-ford':
      return generateDijkstraSteps(input);
    default:
      return [];
  }
}
