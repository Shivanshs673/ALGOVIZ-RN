import { VisualizationStep, TreeNode } from '../../../types/algorithm.types';

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

export function getTreeSteps(algorithmId: string, values: number[], target?: number): VisualizationStep[] {
  const t = target ?? values[Math.floor(values.length / 2)];
  switch (algorithmId) {
    case 'inorder':   return generateInorderSteps(values);
    case 'preorder':  return generatePreorderSteps(values);
    case 'postorder': return generatePostorderSteps(values);
    case 'bst-insert': return generateBSTInsertSteps(values);
    case 'bst-search': return generateBSTSearchSteps(values, t);
    default: return [];
  }
}
