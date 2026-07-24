import type { Algorithm, AlgorithmCategory } from '../../../types/algorithm.types';

export const ALGORITHMS: Algorithm[] = [
  // ─────────────────────────────────────────────
  // SORTING (9)
  // ─────────────────────────────────────────────
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'SORTING',
    difficulty: 'BEGINNER',
    description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.',
    pseudocode: `for i from 0 to n-1:
  for j from 0 to n-i-2:
    if arr[j] > arr[j+1]:
      swap(arr[j], arr[j+1])`,
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    tags: ['comparison', 'in-place', 'stable'],
    applications: ['Small arrays', 'Educational purposes', 'Nearly-sorted data'],
    defaultArraySize: 8,
  },
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'SORTING',
    difficulty: 'BEGINNER',
    description: 'Divides the array into a sorted and an unsorted region. Repeatedly selects the minimum element from the unsorted region and places it at the end of the sorted region.',
    pseudocode: `for i from 0 to n-1:
  minIndex = i
  for j from i+1 to n:
    if arr[j] < arr[minIndex]:
      minIndex = j
  swap(arr[i], arr[minIndex])`,
    timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    tags: ['comparison', 'in-place', 'unstable'],
    applications: ['Small arrays', 'When memory writes are expensive'],
    defaultArraySize: 8,
  },
  {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'SORTING',
    difficulty: 'BEGINNER',
    description: 'Builds the sorted array one element at a time by inserting each new element into its correct position among the previously sorted elements.',
    pseudocode: `for i from 1 to n-1:
  key = arr[i]
  j = i - 1
  while j >= 0 and arr[j] > key:
    arr[j+1] = arr[j]
    j = j - 1
  arr[j+1] = key`,
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    tags: ['comparison', 'in-place', 'stable', 'adaptive'],
    applications: ['Nearly sorted data', 'Small arrays', 'Online sorting', 'Hybrid algorithms'],
    defaultArraySize: 8,
  },
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'SORTING',
    difficulty: 'INTERMEDIATE',
    description: 'A divide-and-conquer algorithm that splits the array in half, recursively sorts each half, then merges the sorted halves.',
    pseudocode: `mergeSort(arr, left, right):
  if left < right:
    mid = (left + right) / 2
    mergeSort(arr, left, mid)
    mergeSort(arr, mid+1, right)
    merge(arr, left, mid, right)

merge(arr, left, mid, right):
  create temp arrays L[], R[]
  copy arr[left..mid] to L[]
  copy arr[mid+1..right] to R[]
  merge L[] and R[] back into arr[]`,
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(n)',
    tags: ['divide-and-conquer', 'stable', 'recursive'],
    applications: ['Linked list sorting', 'External sorting', 'Stable sort required'],
    defaultArraySize: 8,
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    category: 'SORTING',
    difficulty: 'INTERMEDIATE',
    description: 'Picks a pivot element and partitions the array around it. Elements smaller than pivot go left, larger go right. Recursively sorts each partition.',
    pseudocode: `quickSort(arr, low, high):
  if low < high:
    pivot = partition(arr, low, high)
    quickSort(arr, low, pivot-1)
    quickSort(arr, pivot+1, high)

partition(arr, low, high):
  pivot = arr[high]
  i = low - 1
  for j from low to high-1:
    if arr[j] <= pivot:
      i++
      swap(arr[i], arr[j])
  swap(arr[i+1], arr[high])
  return i + 1`,
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    spaceComplexity: 'O(log n)',
    tags: ['divide-and-conquer', 'in-place', 'unstable', 'recursive'],
    applications: ['General-purpose sorting', 'Virtual memory systems', 'Numerical computing'],
    defaultArraySize: 8,
  },
  {
    id: 'heap-sort',
    name: 'Heap Sort',
    category: 'SORTING',
    difficulty: 'INTERMEDIATE',
    description: 'Uses a binary heap data structure. First builds a max-heap from the data, then repeatedly extracts the maximum element to produce a sorted array.',
    pseudocode: `heapSort(arr):
  buildMaxHeap(arr)
  for i from n-1 to 1:
    swap(arr[0], arr[i])
    heapify(arr, 0, i)

heapify(arr, i, n):
  largest = i
  left = 2*i + 1; right = 2*i + 2
  if left < n and arr[left] > arr[largest]: largest = left
  if right < n and arr[right] > arr[largest]: largest = right
  if largest != i:
    swap(arr[i], arr[largest])
    heapify(arr, largest, n)`,
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(1)',
    tags: ['heap', 'in-place', 'unstable'],
    applications: ['Priority queues', 'When guaranteed O(n log n) is needed'],
    defaultArraySize: 8,
  },
  {
    id: 'shell-sort',
    name: 'Shell Sort',
    category: 'SORTING',
    difficulty: 'INTERMEDIATE',
    description: 'Generalization of insertion sort. Sorts elements far apart first, gradually reducing the gap. Allows exchange of far-apart elements unlike insertion sort.',
    pseudocode: `shellSort(arr):
  gap = n / 2
  while gap > 0:
    for i from gap to n-1:
      temp = arr[i]
      j = i
      while j >= gap and arr[j-gap] > temp:
        arr[j] = arr[j-gap]
        j -= gap
      arr[j] = temp
    gap = gap / 2`,
    timeComplexity: { best: 'O(n log n)', average: 'O(n log² n)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    tags: ['comparison', 'in-place', 'unstable'],
    applications: ['Embedded systems', 'Small-to-medium arrays'],
    defaultArraySize: 8,
  },
  {
    id: 'counting-sort',
    name: 'Counting Sort',
    category: 'SORTING',
    difficulty: 'INTERMEDIATE',
    description: 'Non-comparison-based sort. Counts the occurrences of each distinct element and uses arithmetic to determine positions in the sorted array.',
    pseudocode: `countingSort(arr, k):
  count = array of k+1 zeros
  for each x in arr: count[x]++
  for i from 1 to k: count[i] += count[i-1]
  for j from n-1 to 0:
    output[count[arr[j]]-1] = arr[j]
    count[arr[j]]--
  copy output to arr`,
    timeComplexity: { best: 'O(n+k)', average: 'O(n+k)', worst: 'O(n+k)' },
    spaceComplexity: 'O(k)',
    tags: ['non-comparison', 'stable', 'integer-only'],
    applications: ['Integer sorting with small range', 'Character sorting', 'Radix sort subroutine'],
    defaultArraySize: 8,
  },
  {
    id: 'radix-sort',
    name: 'Radix Sort',
    category: 'SORTING',
    difficulty: 'ADVANCED',
    description: 'Sorts integers digit by digit from least significant to most significant, using counting sort as a subroutine for each digit position.',
    pseudocode: `radixSort(arr):
  max = getMax(arr)
  for exp = 1; max/exp > 0; exp *= 10:
    countingSortByDigit(arr, exp)`,
    timeComplexity: { best: 'O(n·d)', average: 'O(n·d)', worst: 'O(n·d)' },
    spaceComplexity: 'O(n+k)',
    tags: ['non-comparison', 'stable', 'integer-only'],
    applications: ['Large integer arrays', 'Fixed-length string sorting', 'IP address sorting'],
    defaultArraySize: 6,
  },

  // ─────────────────────────────────────────────
  // SEARCHING (5)
  // ─────────────────────────────────────────────
  {
    id: 'linear-search',
    name: 'Linear Search',
    category: 'SEARCHING',
    difficulty: 'BEGINNER',
    description: 'Sequentially checks each element of the list until a match is found or the end is reached.',
    pseudocode: `linearSearch(arr, target):
  for i from 0 to n-1:
    if arr[i] == target:
      return i
  return -1`,
    timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(1)',
    tags: ['sequential', 'unsorted-works'],
    applications: ['Unsorted arrays', 'Linked lists', 'Small datasets'],
    defaultArraySize: 10,
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'SEARCHING',
    difficulty: 'BEGINNER',
    description: 'Searches a sorted array by repeatedly dividing the search interval in half. Compares the target with the middle element and eliminates half the remaining elements.',
    pseudocode: `binarySearch(arr, target):
  left = 0; right = n - 1
  while left <= right:
    mid = (left + right) / 2
    if arr[mid] == target: return mid
    if arr[mid] < target: left = mid + 1
    else: right = mid - 1
  return -1`,
    timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(1)',
    tags: ['divide-and-conquer', 'sorted-required'],
    applications: ['Dictionary lookup', 'Database indexing', 'Debugging with Git bisect'],
    defaultArraySize: 10,
  },
  {
    id: 'jump-search',
    name: 'Jump Search',
    category: 'SEARCHING',
    difficulty: 'INTERMEDIATE',
    description: 'Searches sorted array by jumping ahead by fixed steps (√n), then doing linear search in the identified block.',
    pseudocode: `jumpSearch(arr, target):
  step = √n
  prev = 0
  while arr[min(step,n)-1] < target:
    prev = step
    step += √n
    if prev >= n: return -1
  while arr[prev] < target:
    prev++
    if prev == min(step,n): return -1
  if arr[prev] == target: return prev
  return -1`,
    timeComplexity: { best: 'O(1)', average: 'O(√n)', worst: 'O(√n)' },
    spaceComplexity: 'O(1)',
    tags: ['sorted-required', 'block-based'],
    applications: ['Sorted data on slow random-access media'],
    defaultArraySize: 12,
  },
  {
    id: 'interpolation-search',
    name: 'Interpolation Search',
    category: 'SEARCHING',
    difficulty: 'INTERMEDIATE',
    description: 'Improved binary search for uniformly distributed data. Estimates the position of target using interpolation formula instead of always using the midpoint.',
    pseudocode: `interpolationSearch(arr, target):
  lo = 0; hi = n - 1
  while lo <= hi and target >= arr[lo] and target <= arr[hi]:
    pos = lo + ((target-arr[lo]) * (hi-lo)) / (arr[hi]-arr[lo])
    if arr[pos] == target: return pos
    if arr[pos] < target: lo = pos + 1
    else: hi = pos - 1
  return -1`,
    timeComplexity: { best: 'O(1)', average: 'O(log log n)', worst: 'O(n)' },
    spaceComplexity: 'O(1)',
    tags: ['sorted-required', 'uniform-distribution'],
    applications: ['Phone books', 'Uniformly distributed sorted data'],
    defaultArraySize: 10,
  },
  {
    id: 'exponential-search',
    name: 'Exponential Search',
    category: 'SEARCHING',
    difficulty: 'INTERMEDIATE',
    description: 'Finds the range where the target may be present by doubling the index, then performs binary search within that range.',
    pseudocode: `exponentialSearch(arr, target):
  if arr[0] == target: return 0
  i = 1
  while i < n and arr[i] <= target: i *= 2
  return binarySearch(arr, i/2, min(i, n-1), target)`,
    timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(1)',
    tags: ['sorted-required', 'unbounded-arrays'],
    applications: ['Unbounded/infinite sorted arrays', 'When element is near the beginning'],
    defaultArraySize: 12,
  },

  // ─────────────────────────────────────────────
  // GRAPH (6)
  // ─────────────────────────────────────────────
  {
    id: 'bfs',
    name: 'Breadth-First Search',
    category: 'GRAPH',
    difficulty: 'INTERMEDIATE',
    description: 'Explores graph level by level. Uses a queue to visit all neighbors of a node before moving to the next level.',
    pseudocode: `BFS(graph, start):
  queue = [start]
  visited = {start}
  while queue is not empty:
    node = queue.dequeue()
    process(node)
    for each neighbor of node:
      if neighbor not in visited:
        visited.add(neighbor)
        queue.enqueue(neighbor)`,
    timeComplexity: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' },
    spaceComplexity: 'O(V)',
    tags: ['graph', 'queue', 'level-order'],
    applications: ['Shortest path (unweighted)', 'Social networks', 'Web crawling', 'GPS navigation'],
    defaultArraySize: 6,
  },
  {
    id: 'dfs',
    name: 'Depth-First Search',
    category: 'GRAPH',
    difficulty: 'INTERMEDIATE',
    description: 'Explores as far as possible along each branch before backtracking. Uses a stack (or recursion) to traverse the graph.',
    pseudocode: `DFS(graph, node, visited):
  visited.add(node)
  process(node)
  for each neighbor of node:
    if neighbor not in visited:
      DFS(graph, neighbor, visited)`,
    timeComplexity: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' },
    spaceComplexity: 'O(V)',
    tags: ['graph', 'stack', 'recursive'],
    applications: ['Cycle detection', 'Topological sort', 'Maze solving', 'Connected components'],
    defaultArraySize: 6,
  },
  {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    category: 'GRAPH',
    difficulty: 'ADVANCED',
    description: 'Finds the shortest path from a source node to all other nodes in a weighted graph with non-negative edge weights. Uses a priority queue.',
    pseudocode: `Dijkstra(graph, source):
  dist[source] = 0; dist[v] = ∞ for all others
  pq = priority_queue with (0, source)
  while pq not empty:
    (d, u) = pq.extractMin()
    if d > dist[u]: continue
    for each (v, w) in neighbors(u):
      if dist[u] + w < dist[v]:
        dist[v] = dist[u] + w
        pq.insert((dist[v], v))`,
    timeComplexity: { best: 'O(V²)', average: 'O((V+E) log V)', worst: 'O(V²)' },
    spaceComplexity: 'O(V)',
    tags: ['graph', 'shortest-path', 'greedy', 'weighted'],
    applications: ['GPS navigation', 'Network routing', 'Maps', 'Social networks'],
    defaultArraySize: 5,
  },
  {
    id: 'prims',
    name: "Prim's Algorithm",
    category: 'GRAPH',
    difficulty: 'ADVANCED',
    description: 'Finds the Minimum Spanning Tree of a weighted undirected graph. Greedily grows the MST by always adding the cheapest edge connecting a visited node to an unvisited one.',
    pseudocode: `Prim(graph):
  MST = {}; key[0] = 0; key[v] = ∞ for all others
  inMST = [false] * V
  while MST has fewer than V-1 edges:
    u = vertex with minimum key not in MST
    inMST[u] = true
    for each (v, w) in neighbors(u):
      if not inMST[v] and w < key[v]:
        key[v] = w; parent[v] = u
  return MST`,
    timeComplexity: { best: 'O(V²)', average: 'O((V+E) log V)', worst: 'O(V²)' },
    spaceComplexity: 'O(V)',
    tags: ['graph', 'mst', 'greedy'],
    applications: ['Network design', 'Cluster analysis', 'Image segmentation'],
    defaultArraySize: 5,
  },
  {
    id: 'kruskal',
    name: "Kruskal's Algorithm",
    category: 'GRAPH',
    difficulty: 'ADVANCED',
    description: 'Finds MST by sorting all edges by weight and adding them greedily if they do not form a cycle. Uses Union-Find data structure.',
    pseudocode: `Kruskal(graph):
  sort edges by weight
  uf = UnionFind(V)
  MST = {}
  for each edge (u, v, w) in sorted edges:
    if uf.find(u) != uf.find(v):
      MST.add(u, v, w)
      uf.union(u, v)
  return MST`,
    timeComplexity: { best: 'O(E log E)', average: 'O(E log E)', worst: 'O(E log E)' },
    spaceComplexity: 'O(V)',
    tags: ['graph', 'mst', 'union-find', 'greedy'],
    applications: ['Network design', 'Approximation algorithms'],
    defaultArraySize: 5,
  },
  {
    id: 'floyd-warshall',
    name: 'Floyd-Warshall',
    category: 'GRAPH',
    difficulty: 'ADVANCED',
    description: 'Finds shortest paths between ALL pairs of vertices in a weighted graph. Uses dynamic programming.',
    pseudocode: `FloydWarshall(graph):
  dist = adjacency matrix of graph
  for k from 0 to V-1:
    for i from 0 to V-1:
      for j from 0 to V-1:
        if dist[i][k] + dist[k][j] < dist[i][j]:
          dist[i][j] = dist[i][k] + dist[k][j]`,
    timeComplexity: { best: 'O(V³)', average: 'O(V³)', worst: 'O(V³)' },
    spaceComplexity: 'O(V²)',
    tags: ['graph', 'all-pairs', 'dynamic-programming'],
    applications: ['Network routing tables', 'Transitive closure', 'Detecting negative cycles'],
    defaultArraySize: 4,
  },

  // ─────────────────────────────────────────────
  // TREE (5)
  // ─────────────────────────────────────────────
  {
    id: 'bst-insert',
    name: 'BST Insertion',
    category: 'TREE',
    difficulty: 'BEGINNER',
    description: 'Inserts values into a Binary Search Tree maintaining the BST property: left subtree < node < right subtree.',
    pseudocode: `insert(root, value):
  if root is null: return newNode(value)
  if value < root.value:
    root.left = insert(root.left, value)
  else if value > root.value:
    root.right = insert(root.right, value)
  return root`,
    timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' },
    spaceComplexity: 'O(h)',
    tags: ['tree', 'bst', 'recursive'],
    applications: ['Database indexing', 'Symbol tables', 'Priority queues'],
    defaultArraySize: 7,
  },
  {
    id: 'bst-search',
    name: 'BST Search',
    category: 'TREE',
    difficulty: 'BEGINNER',
    description: 'Searches for a value in a Binary Search Tree by comparing and navigating left or right.',
    pseudocode: `search(root, target):
  if root is null or root.value == target:
    return root
  if target < root.value:
    return search(root.left, target)
  return search(root.right, target)`,
    timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(n)' },
    spaceComplexity: 'O(h)',
    tags: ['tree', 'bst', 'recursive'],
    applications: ['Ordered data retrieval'],
    defaultArraySize: 7,
  },
  {
    id: 'inorder',
    name: 'Inorder Traversal',
    category: 'TREE',
    difficulty: 'BEGINNER',
    description: 'Visits nodes in Left → Root → Right order. For a BST, this produces elements in sorted order.',
    pseudocode: `inorder(node):
  if node is null: return
  inorder(node.left)
  visit(node)
  inorder(node.right)`,
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(h)',
    tags: ['tree', 'traversal', 'recursive'],
    applications: ['Sorted output from BST', 'Expression trees'],
    defaultArraySize: 7,
  },
  {
    id: 'preorder',
    name: 'Preorder Traversal',
    category: 'TREE',
    difficulty: 'BEGINNER',
    description: 'Visits nodes in Root → Left → Right order. Used to create a copy of the tree.',
    pseudocode: `preorder(node):
  if node is null: return
  visit(node)
  preorder(node.left)
  preorder(node.right)`,
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(h)',
    tags: ['tree', 'traversal', 'recursive'],
    applications: ['Tree serialization', 'Prefix expression evaluation'],
    defaultArraySize: 7,
  },
  {
    id: 'postorder',
    name: 'Postorder Traversal',
    category: 'TREE',
    difficulty: 'BEGINNER',
    description: 'Visits nodes in Left → Right → Root order. Used to delete a tree (children before parent).',
    pseudocode: `postorder(node):
  if node is null: return
  postorder(node.left)
  postorder(node.right)
  visit(node)`,
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(h)',
    tags: ['tree', 'traversal', 'recursive'],
    applications: ['Tree deletion', 'Postfix expression evaluation', 'Dependency resolution'],
    defaultArraySize: 7,
  },

  // ─────────────────────────────────────────────
  // DYNAMIC PROGRAMMING (4)
  // ─────────────────────────────────────────────
  {
    id: 'lcs',
    name: 'Longest Common Subsequence',
    category: 'DYNAMIC_PROGRAMMING',
    difficulty: 'INTERMEDIATE',
    description: 'Finds the longest subsequence common to two sequences. Uses a DP table where dp[i][j] = LCS length of first i characters of X and first j characters of Y.',
    pseudocode: `LCS(X, Y, m, n):
  dp = matrix (m+1) x (n+1) of zeros
  for i from 1 to m:
    for j from 1 to n:
      if X[i] == Y[j]:
        dp[i][j] = dp[i-1][j-1] + 1
      else:
        dp[i][j] = max(dp[i-1][j], dp[i][j-1])
  return dp[m][n]`,
    timeComplexity: { best: 'O(m·n)', average: 'O(m·n)', worst: 'O(m·n)' },
    spaceComplexity: 'O(m·n)',
    tags: ['dynamic-programming', '2d-dp', 'sequence'],
    applications: ['Diff tools (git diff)', 'DNA sequence alignment', 'Spell checking'],
    defaultArraySize: 5,
  },
  {
    id: 'knapsack',
    name: '0/1 Knapsack',
    category: 'DYNAMIC_PROGRAMMING',
    difficulty: 'INTERMEDIATE',
    description: 'Given items with weights and values, find the most valuable subset that fits in a knapsack of capacity W. Each item can be taken at most once.',
    pseudocode: `knapsack(W, weights, values, n):
  dp = matrix (n+1) x (W+1) of zeros
  for i from 1 to n:
    for w from 0 to W:
      if weights[i] <= w:
        dp[i][w] = max(dp[i-1][w],
                       values[i] + dp[i-1][w-weights[i]])
      else:
        dp[i][w] = dp[i-1][w]
  return dp[n][W]`,
    timeComplexity: { best: 'O(n·W)', average: 'O(n·W)', worst: 'O(n·W)' },
    spaceComplexity: 'O(n·W)',
    tags: ['dynamic-programming', '2d-dp', 'optimization'],
    applications: ['Resource allocation', 'Budget management', 'Cutting stock'],
    defaultArraySize: 4,
  },
  {
    id: 'lis',
    name: 'Longest Increasing Subsequence',
    category: 'DYNAMIC_PROGRAMMING',
    difficulty: 'INTERMEDIATE',
    description: 'Finds the length of the longest subsequence of a given sequence in which all elements are in increasing order.',
    pseudocode: `LIS(arr, n):
  dp[i] = 1 for all i
  for i from 1 to n-1:
    for j from 0 to i-1:
      if arr[j] < arr[i]:
        dp[i] = max(dp[i], dp[j] + 1)
  return max(dp)`,
    timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(n)',
    tags: ['dynamic-programming', '1d-dp'],
    applications: ['Card game patience sorting', 'Longest chain problems'],
    defaultArraySize: 8,
  },
  {
    id: 'coin-change',
    name: 'Coin Change',
    category: 'DYNAMIC_PROGRAMMING',
    difficulty: 'INTERMEDIATE',
    description: 'Finds the minimum number of coins needed to make a target amount. Uses DP where dp[i] = min coins needed for amount i.',
    pseudocode: `coinChange(coins, amount):
  dp = [∞] * (amount+1); dp[0] = 0
  for i from 1 to amount:
    for each coin in coins:
      if coin <= i:
        dp[i] = min(dp[i], dp[i-coin] + 1)
  return dp[amount] if dp[amount] != ∞ else -1`,
    timeComplexity: { best: 'O(n·m)', average: 'O(n·m)', worst: 'O(n·m)' },
    spaceComplexity: 'O(n)',
    tags: ['dynamic-programming', '1d-dp', 'optimization'],
    applications: ['Vending machines', 'Currency exchange', 'Resource allocation'],
    defaultArraySize: 6,
  },

  // ─────────────────────────────────────────────
  // GREEDY (2)
  // ─────────────────────────────────────────────
  {
    id: 'activity-selection',
    name: 'Activity Selection',
    category: 'GREEDY',
    difficulty: 'INTERMEDIATE',
    description: 'Selects the maximum number of non-overlapping activities. Always picks the activity that finishes earliest.',
    pseudocode: `activitySelection(start, finish, n):
  sort activities by finish time
  selected = [0]  (first activity always selected)
  lastFinish = finish[0]
  for i from 1 to n-1:
    if start[i] >= lastFinish:
      selected.add(i)
      lastFinish = finish[i]
  return selected`,
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(n)',
    tags: ['greedy', 'interval-scheduling'],
    applications: ['Job scheduling', 'Meeting room allocation', 'CPU task scheduling'],
    defaultArraySize: 6,
  },
  {
    id: 'huffman',
    name: 'Huffman Coding',
    category: 'GREEDY',
    difficulty: 'ADVANCED',
    description: 'Lossless data compression algorithm that assigns variable-length codes to characters based on frequency. More frequent characters get shorter codes.',
    pseudocode: `huffman(chars, freq):
  pq = min-heap of (freq, char) pairs
  while pq.size > 1:
    left = pq.extractMin()
    right = pq.extractMin()
    internal = newNode(left.freq + right.freq)
    internal.left = left; internal.right = right
    pq.insert(internal)
  root = pq.extractMin()
  generateCodes(root, "")`,
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(n)',
    tags: ['greedy', 'compression', 'tree'],
    applications: ['File compression (ZIP, GZIP)', 'JPEG compression', 'MP3 encoding'],
    defaultArraySize: 6,
  },

  // ─────────────────────────────────────────────
  // BACKTRACKING (2)
  // ─────────────────────────────────────────────
  {
    id: 'n-queens',
    name: 'N-Queens Problem',
    category: 'BACKTRACKING',
    difficulty: 'ADVANCED',
    description: 'Places N queens on an N×N chessboard so no two queens attack each other. Uses backtracking to try placements and backtrack when a conflict is found.',
    pseudocode: `solveNQueens(board, row, n):
  if row == n: solution found! return true
  for col from 0 to n-1:
    if isSafe(board, row, col, n):
      board[row][col] = 1       (place queen)
      if solveNQueens(board, row+1, n): return true
      board[row][col] = 0       (backtrack)
  return false`,
    timeComplexity: { best: 'O(N!)', average: 'O(N!)', worst: 'O(N!)' },
    spaceComplexity: 'O(N²)',
    tags: ['backtracking', 'constraint-satisfaction'],
    applications: ['Constraint satisfaction', 'Parallel computing (conflict-free)', 'Puzzle solving'],
    defaultArraySize: 6,
  },
  {
    id: 'sudoku',
    name: 'Sudoku Solver',
    category: 'BACKTRACKING',
    difficulty: 'ADVANCED',
    description: 'Solves a Sudoku puzzle by trying digits 1–9 in empty cells and backtracking when a conflict is detected.',
    pseudocode: `solveSudoku(board):
  for each empty cell (row, col):
    for num from 1 to 9:
      if isValid(board, row, col, num):
        board[row][col] = num
        if solveSudoku(board): return true
        board[row][col] = 0     (backtrack)
    return false    (no valid num found)
  return true       (all cells filled)`,
    timeComplexity: { best: 'O(1)', average: 'O(9^m)', worst: 'O(9^81)' },
    spaceComplexity: 'O(1)',
    tags: ['backtracking', 'constraint-satisfaction'],
    applications: ['Puzzle solving', 'Constraint programming', 'Scheduling'],
    defaultArraySize: 9,
  },

  // ─────────────────────────────────────────────
  // STRING (1)
  // ─────────────────────────────────────────────
  {
    id: 'kmp',
    name: 'KMP String Matching',
    category: 'STRING',
    difficulty: 'ADVANCED',
    description: 'Searches for a pattern in text efficiently using a failure function (partial match table) to avoid redundant comparisons.',
    pseudocode: `KMP(text, pattern):
  lps = computeLPS(pattern)
  i = 0; j = 0
  while i < len(text):
    if text[i] == pattern[j]:
      i++; j++
    if j == len(pattern):
      found at i-j; j = lps[j-1]
    elif i < len(text) and text[i] != pattern[j]:
      if j != 0: j = lps[j-1]
      else: i++`,
    timeComplexity: { best: 'O(n)', average: 'O(n+m)', worst: 'O(n+m)' },
    spaceComplexity: 'O(m)',
    tags: ['string-matching', 'failure-function'],
    applications: ['Text editors (Ctrl+F)', 'Virus scanning', 'DNA sequence search'],
    defaultArraySize: 8,
  },

  // ─────────────────────────────────────────────
  // TRIE (1)
  // ─────────────────────────────────────────────
  {
    id: 'trie',
    name: 'Trie Operations',
    category: 'TRIE',
    difficulty: 'INTERMEDIATE',
    description: 'Inserts and searches strings in a trie (prefix tree) data structure. Each node represents a character.',
    pseudocode: `insert(root, word):
  node = root
  for each char in word:
    if char not in node.children:
      node.children[char] = newNode()
    node = node.children[char]
  node.isEndOfWord = true

search(root, word):
  node = root
  for each char in word:
    if char not in node.children: return false
    node = node.children[char]
  return node.isEndOfWord`,
    timeComplexity: { best: 'O(m)', average: 'O(m)', worst: 'O(m)' },
    spaceComplexity: 'O(alphabet × m × n)',
    tags: ['trie', 'prefix-tree', 'string'],
    applications: ['Autocomplete', 'Spell checker', 'IP routing tables', 'Phone directory'],
    defaultArraySize: 5,
  },
  {
    id: 'bucket-sort',
    name: 'Bucket Sort',
    category: 'SORTING',
    difficulty: 'INTERMEDIATE',
    description: 'Distributes elements into buckets, sorts each bucket, then concatenates.',
    pseudocode: `bucketSort(arr): distribute → sort buckets → merge`,
    timeComplexity: { best: 'O(n)', average: 'O(n+k)', worst: 'O(n²)' },
    spaceComplexity: 'O(n+k)',
    tags: ['distribution'],
    applications: ['Uniform data', 'Floating point sort'],
    defaultArraySize: 8,
  },
  {
    id: 'ternary-search',
    name: 'Ternary Search',
    category: 'SEARCHING',
    difficulty: 'INTERMEDIATE',
    description: 'Divides sorted array into three parts to locate a target.',
    pseudocode: `mid1 = l+(r-l)/3; mid2 = r-(r-l)/3`,
    timeComplexity: { best: 'O(1)', average: 'O(log₃ n)', worst: 'O(log₃ n)' },
    spaceComplexity: 'O(1)',
    tags: ['search'],
    applications: ['Unimodal functions', 'Sorted arrays'],
    defaultArraySize: 8,
  },
  {
    id: 'topological-sort',
    name: 'Topological Sort',
    category: 'GRAPH',
    difficulty: 'INTERMEDIATE',
    description: 'Orders DAG vertices so all edges go forward.',
    pseudocode: `Kahn BFS or DFS post-order on DAG`,
    timeComplexity: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' },
    spaceComplexity: 'O(V)',
    tags: ['dag'],
    applications: ['Course schedule', 'Build order'],
    defaultArraySize: 6,
  },
  {
    id: 'bellman-ford',
    name: 'Bellman-Ford',
    category: 'GRAPH',
    difficulty: 'ADVANCED',
    description: 'Shortest paths with negative edge weights.',
    pseudocode: `Relax all edges V-1 times`,
    timeComplexity: { best: 'O(VE)', average: 'O(VE)', worst: 'O(VE)' },
    spaceComplexity: 'O(V)',
    tags: ['shortest-path'],
    applications: ['Arbitrage', 'Routing'],
    defaultArraySize: 6,
  },
  {
    id: 'fibonacci-dp',
    name: 'Fibonacci (DP)',
    category: 'DYNAMIC_PROGRAMMING',
    difficulty: 'BEGINNER',
    description: 'Bottom-up DP for Fibonacci numbers.',
    pseudocode: `dp[i]=dp[i-1]+dp[i-2]`,
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    tags: ['dp'],
    applications: ['DP introduction'],
    defaultArraySize: 8,
  },
  {
    id: 'matrix-chain',
    name: 'Matrix Chain Multiplication',
    category: 'DYNAMIC_PROGRAMMING',
    difficulty: 'ADVANCED',
    description: 'Optimal parenthesization for matrix multiplication.',
    pseudocode: `dp[i][j] = min cost splits`,
    timeComplexity: { best: 'O(n³)', average: 'O(n³)', worst: 'O(n³)' },
    spaceComplexity: 'O(n²)',
    tags: ['dp', '2d'],
    applications: ['Compilers', 'Graphics'],
    defaultArraySize: 8,
  },
  {
    id: 'fractional-knapsack',
    name: 'Fractional Knapsack',
    category: 'GREEDY',
    difficulty: 'INTERMEDIATE',
    description: 'Greedy by value/weight ratio with fractional items.',
    pseudocode: `Sort by v/w; take greedily`,
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(1)',
    tags: ['greedy'],
    applications: ['Resource allocation'],
    defaultArraySize: 5,
  },
  {
    id: 'naive-string-match',
    name: 'Naive String Match',
    category: 'STRING',
    difficulty: 'BEGINNER',
    description: 'Brute-force pattern matching in text.',
    pseudocode: `Slide window, compare chars`,
    timeComplexity: { best: 'O(n)', average: 'O(nm)', worst: 'O(nm)' },
    spaceComplexity: 'O(1)',
    tags: ['string'],
    applications: ['Short texts'],
    defaultArraySize: 8,
  },
  {
    id: 'rabin-karp',
    name: 'Rabin-Karp',
    category: 'STRING',
    difficulty: 'INTERMEDIATE',
    description: 'Rolling-hash string matching.',
    pseudocode: `Compare hash of pattern vs windows`,
    timeComplexity: { best: 'O(n+m)', average: 'O(n+m)', worst: 'O(nm)' },
    spaceComplexity: 'O(1)',
    tags: ['hash'],
    applications: ['Plagiarism detection'],
    defaultArraySize: 8,
  },
];

export const ALGORITHMS_PER_CATEGORY: Record<string, number> = {
  SORTING: 10,
  SEARCHING: 6,
  GRAPH: 8,
  TREE: 5,
  DYNAMIC_PROGRAMMING: 6,
  GREEDY: 3,
  BACKTRACKING: 2,
  STRING: 3,
  TRIE: 1,
};

export function getAlgorithmById(id: string): Algorithm | undefined {
  return ALGORITHMS.find((a) => a.id === id);
}

export function getAlgorithmsByCategory(category: AlgorithmCategory): Algorithm[] {
  return ALGORITHMS.filter((a) => a.category === category);
}

export function getAllCategories(): AlgorithmCategory[] {
  return [...new Set(ALGORITHMS.map((a) => a.category))];
}

export function searchAlgorithms(query: string): Algorithm[] {
  const q = query.toLowerCase().trim();
  if (!q) return ALGORITHMS;
  return ALGORITHMS.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q)) ||
      a.category.toLowerCase().includes(q)
  );
}