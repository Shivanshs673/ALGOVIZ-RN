export type ConceptCategory =
  | 'COMPLEXITY'
  | 'DATA_STRUCTURES'
  | 'ALGORITHM_PATTERNS'
  | 'INTERVIEW_TIPS'
  | 'MATH_FOUNDATIONS';

export interface ConceptExample {
  title: string;
  code: string;
  explanation: string;
}

export interface Concept {
  id: string;
  title: string;
  subtitle: string;
  category: ConceptCategory;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  icon: string;              // Emoji icon
  summary: string;           // 1–2 sentence summary (card view)
  content: ConceptSection[]; // Detailed sections (detail view)
  relatedAlgorithms?: string[]; // Algorithm IDs
  tags: string[];
}

export interface ConceptSection {
  type: 'text' | 'code' | 'table' | 'tip' | 'warning';
  heading?: string;
  body?: string;
  code?: string;
  language?: string;
  tableHeaders?: string[];
  tableRows?: string[][];
}

export const CONCEPTS: Concept[] = [
  // ─────────────────────────────────────────────
  // COMPLEXITY
  // ─────────────────────────────────────────────
  {
    id: 'big-o',
    title: 'Big O Notation',
    subtitle: 'Measuring Algorithm Efficiency',
    category: 'COMPLEXITY',
    difficulty: 'BEGINNER',
    icon: '📊',
    summary: 'Big O describes how an algorithm\'s runtime or space grows as input size grows. It\'s the universal language for comparing algorithm efficiency.',
    tags: ['time-complexity', 'space-complexity', 'analysis'],
    relatedAlgorithms: ['bubble-sort', 'binary-search', 'merge-sort'],
    content: [
      {
        type: 'text',
        heading: 'What is Big O?',
        body: 'Big O notation describes the WORST-CASE growth rate of an algorithm. When we say an algorithm is O(n²), we mean: as the input doubles, the runtime roughly quadruples. It gives us a way to compare algorithms without worrying about hardware.',
      },
      {
        type: 'table',
        heading: 'Common Complexities (Best → Worst)',
        tableHeaders: ['Notation', 'Name', 'Example', 'n=1000 ops'],
        tableRows: [
          ['O(1)',       'Constant',     'Array index lookup',     '1'],
          ['O(log n)',   'Logarithmic',  'Binary search',          '~10'],
          ['O(n)',       'Linear',       'Linear search',          '1,000'],
          ['O(n log n)', 'Linearithmic', 'Merge sort',             '~10,000'],
          ['O(n²)',      'Quadratic',    'Bubble sort',            '1,000,000'],
          ['O(2ⁿ)',      'Exponential',  'Brute-force subsets',    '10^301'],
          ['O(n!)',      'Factorial',    'Permutation generation', 'impossible'],
        ],
      },
      {
        type: 'code',
        heading: 'Identifying Complexity',
        code: `// O(1) - doesn't depend on n
function getFirst(arr: number[]): number {
  return arr[0];
}

// O(n) - one loop over all elements
function findMax(arr: number[]): number {
  let max = arr[0];
  for (const x of arr) if (x > max) max = x;
  return max;
}

// O(n²) - nested loop
function hasDuplicate(arr: number[]): boolean {
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)
      if (arr[i] === arr[j]) return true;
  return false;
}

// O(log n) - halving the search space each step
function binarySearch(arr: number[], target: number): number {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] === target) return mid;
    arr[mid] < target ? lo = mid + 1 : hi = mid - 1;
  }
  return -1;
}`,
        language: 'typescript',
      },
      {
        type: 'tip',
        heading: '💡 Drop Constants and Lower Terms',
        body: 'O(2n) → O(n). O(n² + n) → O(n²). Big O only cares about the dominant term as n → ∞.',
      },
      {
        type: 'text',
        heading: 'Space Complexity',
        body: 'Space complexity measures how much extra memory an algorithm uses. O(1) space = in-place. O(n) space = uses a copy of the data. Merge sort is O(n log n) time but O(n) space because it needs extra arrays.',
      },
    ],
  },
  {
    id: 'time-vs-space',
    title: 'Time vs Space Tradeoff',
    subtitle: 'When to Trade Memory for Speed',
    category: 'COMPLEXITY',
    difficulty: 'BEGINNER',
    icon: '⚖️',
    summary: 'Often you can make an algorithm faster by using more memory (caching, hash maps) or use less memory at the cost of speed. Understanding this tradeoff is key to optimization.',
    tags: ['memoization', 'caching', 'tradeoff'],
    content: [
      { type: 'text', heading: 'The Core Tradeoff', body: 'Hash maps are O(1) lookup but use O(n) space. If you compute the same result repeatedly, storing it (memoization) trades space for time. Dynamic programming is the systematic application of this idea.' },
      {
        type: 'code', heading: 'Example: Fibonacci',
        code: `// O(2ⁿ) time, O(n) stack space — SLOW for large n
function fibSlow(n: number): number {
  if (n <= 1) return n;
  return fibSlow(n-1) + fibSlow(n-2);
}

// O(n) time, O(n) space — FAST with memoization
function fibMemo(n: number, memo: Map<number,number> = new Map()): number {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n)!;
  const result = fibMemo(n-1, memo) + fibMemo(n-2, memo);
  memo.set(n, result);
  return result;
}

// O(n) time, O(1) space — FAST and SPACE EFFICIENT
function fibDP(n: number): number {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}`,
        language: 'typescript',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // DATA STRUCTURES
  // ─────────────────────────────────────────────
  {
    id: 'arrays',
    title: 'Arrays & Dynamic Arrays',
    subtitle: 'The Foundation of All Data Structures',
    category: 'DATA_STRUCTURES',
    difficulty: 'BEGINNER',
    icon: '📦',
    summary: 'Arrays store elements in contiguous memory. Random access is O(1). Insertion/deletion at the middle is O(n). Dynamic arrays (like JavaScript\'s Array) resize automatically.',
    tags: ['array', 'random-access', 'contiguous-memory'],
    content: [
      { type: 'table', heading: 'Array Operations', tableHeaders: ['Operation', 'Time', 'Notes'], tableRows: [['Access by index', 'O(1)', 'Direct memory calculation'], ['Search (unsorted)', 'O(n)', 'Linear scan'], ['Search (sorted)', 'O(log n)', 'Binary search'], ['Insert at end', 'O(1) amortized', 'Dynamic resize occasionally'], ['Insert at middle', 'O(n)', 'Shift elements right'], ['Delete at middle', 'O(n)', 'Shift elements left']] },
      { type: 'code', heading: 'Key Patterns', code: `// Two pointers pattern (O(n))
function reverseArray(arr: number[]): number[] {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++; right--;
  }
  return arr;
}

// Sliding window (O(n))
function maxSumSubarrayOfSizeK(arr: number[], k: number): number {
  let windowSum = arr.slice(0, k).reduce((a, b) => a + b, 0);
  let maxSum = windowSum;
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}`, language: 'typescript' },
    ],
  },
  {
    id: 'linked-list',
    title: 'Linked Lists',
    subtitle: 'Dynamic Data with Pointer Chains',
    category: 'DATA_STRUCTURES',
    difficulty: 'BEGINNER',
    icon: '🔗',
    summary: 'Linked lists store elements in nodes, each pointing to the next. Insertion/deletion at known position is O(1) but access is O(n). No random access — great for frequent insertions/deletions.',
    tags: ['linked-list', 'singly', 'doubly', 'pointers'],
    content: [
      { type: 'table', heading: 'Linked List vs Array', tableHeaders: ['Operation', 'Array', 'Linked List'], tableRows: [['Access by index', 'O(1)', 'O(n)'], ['Insert at start', 'O(n)', 'O(1)'], ['Insert at end', 'O(1)*', 'O(n) or O(1) with tail'], ['Insert in middle', 'O(n)', 'O(1) (if pointer known)'], ['Memory', 'Contiguous', 'Scattered (pointer overhead)']] },
      {
        type: 'code', heading: 'Singly Linked List in TypeScript', code: `class ListNode<T> {
  constructor(public val: T, public next: ListNode<T> | null = null) {}
}

class LinkedList<T> {
  head: ListNode<T> | null = null;
  size = 0;

  prepend(val: T): void {
    this.head = new ListNode(val, this.head);
    this.size++;
  }

  append(val: T): void {
    const node = new ListNode(val);
    if (!this.head) { this.head = node; }
    else { let curr = this.head; while (curr.next) curr = curr.next; curr.next = node; }
    this.size++;
  }

  // Reverse in-place: O(n) time, O(1) space
  reverse(): void {
    let prev: ListNode<T> | null = null;
    let curr = this.head;
    while (curr) {
      const next = curr.next;
      curr.next = prev;
      prev = curr;
      curr = next;
    }
    this.head = prev;
  }

  // Floyd's cycle detection
  hasCycle(): boolean {
    let slow = this.head, fast = this.head;
    while (fast && fast.next) {
      slow = slow!.next;
      fast = fast.next.next;
      if (slow === fast) return true;
    }
    return false;
  }
}`, language: 'typescript',
      },
    ],
  },
  {
    id: 'hash-map',
    title: 'Hash Maps & Sets',
    subtitle: 'O(1) Lookup with Key-Value Storage',
    category: 'DATA_STRUCTURES',
    difficulty: 'BEGINNER',
    icon: '#️⃣',
    summary: 'Hash maps provide O(1) average lookup, insert, and delete. They\'re the most-used data structure in interview problems. Learn to use them for counting, caching, and lookup table optimization.',
    tags: ['hash-map', 'hash-set', 'O(1)-lookup'],
    content: [
      { type: 'text', heading: 'When to use a Hash Map', body: '1. Count frequencies of elements. 2. Check if element was seen before. 3. Cache computed results. 4. Convert O(n²) brute-force to O(n) by trading space for time.' },
      {
        type: 'code', heading: 'Classic Hash Map Patterns', code: `// Pattern 1: Count frequencies
function mostCommon(arr: number[]): number {
  const freq = new Map<number, number>();
  for (const x of arr) freq.set(x, (freq.get(x) ?? 0) + 1);
  return [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

// Pattern 2: Two Sum (O(n) with hash map vs O(n²) brute force)
function twoSum(nums: number[], target: number): [number, number] | null {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) return [seen.get(complement)!, i];
    seen.set(nums[i], i);
  }
  return null;
}

// Pattern 3: Check if two strings are anagrams
function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;
  const count = new Map<string, number>();
  for (const c of s) count.set(c, (count.get(c) ?? 0) + 1);
  for (const c of t) {
    if (!count.get(c)) return false;
    count.set(c, count.get(c)! - 1);
  }
  return true;
}`, language: 'typescript',
      },
    ],
  },
  {
    id: 'stack-queue',
    title: 'Stacks & Queues',
    subtitle: 'LIFO vs FIFO Ordering',
    category: 'DATA_STRUCTURES',
    difficulty: 'BEGINNER',
    icon: '📚',
    summary: 'Stack = LIFO (Last In, First Out). Queue = FIFO (First In, First Out). Stacks are used in DFS, expression parsing, and undo systems. Queues power BFS and task scheduling.',
    tags: ['stack', 'queue', 'LIFO', 'FIFO'],
    content: [
      { type: 'table', heading: 'Stack vs Queue', tableHeaders: ['Property', 'Stack', 'Queue'], tableRows: [['Order', 'LIFO', 'FIFO'], ['Add', 'push() to top', 'enqueue() to back'], ['Remove', 'pop() from top', 'dequeue() from front'], ['Peek', 'top element', 'front element'], ['Use in', 'DFS, backtracking, undo', 'BFS, scheduling, print queues']] },
      {
        type: 'code', heading: 'Stack Problems', code: `// Valid parentheses — classic stack problem
function isValid(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
  for (const c of s) {
    if ('({['.includes(c)) stack.push(c);
    else if (stack.pop() !== map[c]) return false;
  }
  return stack.length === 0;
}

// Min stack — O(1) getMin()
class MinStack {
  private stack: number[] = [];
  private minStack: number[] = [];
  push(val: number) {
    this.stack.push(val);
    this.minStack.push(Math.min(val, this.minStack.at(-1) ?? val));
  }
  pop()    { this.stack.pop(); this.minStack.pop(); }
  top()    { return this.stack.at(-1)!; }
  getMin() { return this.minStack.at(-1)!; }
}`, language: 'typescript',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // ALGORITHM PATTERNS
  // ─────────────────────────────────────────────
  {
    id: 'two-pointers',
    title: 'Two Pointers',
    subtitle: 'Linear Optimization with Dual Indices',
    category: 'ALGORITHM_PATTERNS',
    difficulty: 'BEGINNER',
    icon: '👉👈',
    summary: 'Use two pointers moving toward each other (or in the same direction) to solve array problems in O(n) instead of O(n²). Works great on sorted arrays.',
    tags: ['two-pointers', 'linear-time', 'sorted-array'],
    relatedAlgorithms: ['binary-search'],
    content: [
      { type: 'text', body: 'Two pointers: left and right. Move them toward each other based on a condition. Eliminates the need for a nested loop, reducing O(n²) → O(n).' },
      {
        type: 'code', code: `// Find pair with target sum in sorted array
function pairWithTargetSum(arr: number[], target: number): [number, number] | null {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    sum < target ? left++ : right--;
  }
  return null;
}

// Remove duplicates from sorted array in-place
function removeDuplicates(nums: number[]): number {
  let left = 0;
  for (let right = 1; right < nums.length; right++) {
    if (nums[right] !== nums[left]) nums[++left] = nums[right];
  }
  return left + 1;
}

// Container with most water
function maxWater(heights: number[]): number {
  let left = 0, right = heights.length - 1, max = 0;
  while (left < right) {
    max = Math.max(max, Math.min(heights[left], heights[right]) * (right - left));
    heights[left] < heights[right] ? left++ : right--;
  }
  return max;
}`, language: 'typescript',
      },
    ],
  },
  {
    id: 'sliding-window',
    title: 'Sliding Window',
    subtitle: 'Subarray Problems in Linear Time',
    category: 'ALGORITHM_PATTERNS',
    difficulty: 'INTERMEDIATE',
    icon: '🪟',
    summary: 'Maintain a window over a subarray, expanding right and shrinking left based on a condition. Converts O(n²) brute-force subarray problems to O(n).',
    tags: ['sliding-window', 'subarray', 'linear-time'],
    content: [
      { type: 'text', body: 'Pattern: right pointer always advances. Left pointer shrinks the window when a constraint is violated. Track window state with a variable or hash map.' },
      {
        type: 'code', code: `// Longest substring without repeating characters
function longestUniqueSubstr(s: string): number {
  const seen = new Map<string, number>();
  let left = 0, maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    if (seen.has(s[right]) && seen.get(s[right])! >= left) {
      left = seen.get(s[right])! + 1;
    }
    seen.set(s[right], right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}

// Minimum window substring
function minWindow(s: string, t: string): string {
  const need = new Map<string, number>();
  for (const c of t) need.set(c, (need.get(c) ?? 0) + 1);
  let have = 0, required = need.size;
  let left = 0, min = [0, Infinity];
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (need.has(c)) {
      need.set(c, need.get(c)! - 1);
      if (need.get(c) === 0) have++;
    }
    while (have === required) {
      if (right - left < min[1] - min[0]) min = [left, right];
      const lc = s[left++];
      if (need.has(lc)) {
        need.set(lc, need.get(lc)! + 1);
        if (need.get(lc)! > 0) have--;
      }
    }
  }
  return min[1] === Infinity ? '' : s.slice(min[0], min[1] + 1);
}`, language: 'typescript',
      },
    ],
  },
  {
    id: 'recursion-backtracking',
    title: 'Recursion & Backtracking',
    subtitle: 'Exploring All Possibilities Systematically',
    category: 'ALGORITHM_PATTERNS',
    difficulty: 'INTERMEDIATE',
    icon: '🔄',
    summary: 'Recursion breaks a problem into smaller subproblems. Backtracking extends recursion by undoing choices that lead to dead ends, pruning the search space.',
    tags: ['recursion', 'backtracking', 'tree-of-choices', 'pruning'],
    relatedAlgorithms: ['n-queens', 'sudoku'],
    content: [
      { type: 'tip', heading: '🗝 Backtracking Template', body: 'Choose → Explore → Unchoose. If the current state is a dead end, undo your last choice (backtrack) and try the next option.' },
      {
        type: 'code', code: `// Backtracking template
function backtrack(
  result: number[][],
  current: number[],
  candidates: number[],
  start: number,
  target: number
): void {
  if (target === 0) { result.push([...current]); return; }
  for (let i = start; i < candidates.length; i++) {
    if (candidates[i] > target) break; // Pruning
    current.push(candidates[i]);               // Choose
    backtrack(result, current, candidates, i, target - candidates[i]); // Explore
    current.pop();                             // Unchoose
  }
}

// Generate all subsets
function subsets(nums: number[]): number[][] {
  const result: number[][] = [];
  function bt(start: number, current: number[]) {
    result.push([...current]);
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      bt(i + 1, current);
      current.pop();
    }
  }
  bt(0, []);
  return result;
}`, language: 'typescript',
      },
    ],
  },

  // ─────────────────────────────────────────────
  // INTERVIEW TIPS
  // ─────────────────────────────────────────────
  {
    id: 'problem-solving-framework',
    title: 'Problem-Solving Framework',
    subtitle: 'A Repeatable Approach for Any Interview',
    category: 'INTERVIEW_TIPS',
    difficulty: 'BEGINNER',
    icon: '🧠',
    summary: 'Follow this 6-step framework for every coding interview question to maximize your chances of success.',
    tags: ['interview', 'framework', 'communication'],
    content: [
      {
        type: 'text', heading: '6-Step Framework', body: `1. UNDERSTAND — Restate the problem. Ask clarifying questions.
2. EXAMPLES — Work through 2-3 examples including edge cases.
3. BRUTE FORCE — State the naive O(n²) solution first.
4. OPTIMIZE — Identify the bottleneck. Use hints (hash maps, sorting, two pointers).
5. CODE — Write clean code. Talk through your logic while coding.
6. TEST — Trace through your examples. Check edge cases (empty, single element, duplicates).`,
      },
      { type: 'tip', heading: '💬 Always Think Out Loud', body: 'Interviewers want to understand how you think. An incorrect solution with great communication beats a correct silent solution. Say "I\'m thinking about using a hash map here because..."' },
      { type: 'table', heading: 'Complexity Cheat Sheet for Common Patterns', tableHeaders: ['Pattern', 'Time', 'Space', 'Trigger'], tableRows: [['Two Pointers', 'O(n)', 'O(1)', 'Sorted array, pair/triple sum'], ['Sliding Window', 'O(n)', 'O(k)', 'Subarray with constraint'], ['Hash Map', 'O(n)', 'O(n)', 'Lookup, counting, seen-before'], ['Binary Search', 'O(log n)', 'O(1)', 'Sorted array, search space'], ['DFS/BFS', 'O(V+E)', 'O(V)', 'Graphs, trees, paths'], ['DP Memoization', 'O(states)', 'O(states)', 'Overlapping subproblems'], ['Monotonic Stack', 'O(n)', 'O(n)', 'Next greater/smaller element']] },
    ],
  },

  {
    id: 'binary-trees',
    title: 'Binary Trees & BST',
    subtitle: 'Hierarchical Data with O(log n) Search',
    category: 'DATA_STRUCTURES',
    difficulty: 'INTERMEDIATE',
    icon: '🌳',
    summary: 'Each node has at most two children. BST property: left < root < right enables efficient search, insert, delete.',
    tags: ['tree', 'bst', 'recursion'],
    relatedAlgorithms: ['bst-insert', 'bst-search', 'inorder'],
    content: [
      { type: 'table', heading: 'Tree Traversals', tableHeaders: ['Order', 'Sequence', 'Use Case'], tableRows: [['Inorder', 'LNR', 'BST sorted order'], ['Preorder', 'NLR', 'Copy tree'], ['Postorder', 'LRN', 'Delete tree'], ['Level-order', 'BFS', 'Shortest path']] },
      { type: 'tip', heading: 'Balance matters', body: 'Skewed BST degrades to O(n). AVL/Red-Black trees rebalance to O(log n).' },
    ],
  },
  {
    id: 'graphs',
    title: 'Graphs — Representation & Traversal',
    subtitle: 'Nodes, Edges, and Classic Algorithms',
    category: 'DATA_STRUCTURES',
    difficulty: 'INTERMEDIATE',
    icon: '🕸️',
    summary: 'Adjacency list for sparse graphs; matrix for dense. BFS = shortest unweighted paths; DFS = deep exploration.',
    tags: ['graph', 'bfs', 'dfs'],
    relatedAlgorithms: ['bfs', 'dfs', 'dijkstra'],
    content: [
      { type: 'text', heading: 'Representations', body: 'List: O(V+E) space. Matrix: O(V²) space, O(1) edge lookup.' },
    ],
  },
  {
    id: 'heaps',
    title: 'Heaps & Priority Queues',
    subtitle: 'Min/Max in O(log n)',
    category: 'DATA_STRUCTURES',
    difficulty: 'INTERMEDIATE',
    icon: '⛰️',
    summary: 'Complete binary tree in array. Powers Dijkstra, heap sort, and top-K problems.',
    tags: ['heap', 'priority-queue'],
    relatedAlgorithms: ['heap-sort', 'dijkstra'],
    content: [
      { type: 'table', heading: 'Operations', tableHeaders: ['Op', 'Time'], tableRows: [['Insert', 'O(log n)'], ['Extract', 'O(log n)'], ['Peek', 'O(1)']] },
    ],
  },
  {
    id: 'tries-ds',
    title: 'Trie (Prefix Tree)',
    subtitle: 'Efficient String Prefix Operations',
    category: 'DATA_STRUCTURES',
    difficulty: 'INTERMEDIATE',
    icon: '🔤',
    summary: 'O(m) insert/search per word length m. Autocomplete & spell check.',
    tags: ['trie'],
    relatedAlgorithms: ['trie'],
    content: [
      { type: 'text', heading: 'When to use', body: 'Many strings with shared prefixes or prefix queries.' },
    ],
  },
  {
    id: 'union-find',
    title: 'Union-Find (Disjoint Set)',
    subtitle: 'Connected Components in Near O(1)',
    category: 'DATA_STRUCTURES',
    difficulty: 'INTERMEDIATE',
    icon: '🔗',
    summary: 'Path compression + union by rank. Used in Kruskal MST.',
    tags: ['union-find'],
    relatedAlgorithms: ['kruskal'],
    content: [
      { type: 'text', heading: 'Pattern', body: 'Dynamic connectivity — merge sets and query if two nodes share a component.' },
    ],
  },
  {
    id: 'deque',
    title: 'Deque & Monotonic Queue',
    subtitle: 'Sliding Window Optimizations',
    category: 'DATA_STRUCTURES',
    difficulty: 'INTERMEDIATE',
    icon: '↔️',
    summary: 'Push/pop both ends in O(1). Monotonic deque finds window max in O(n).',
    tags: ['deque', 'sliding-window'],
    content: [
      { type: 'tip', heading: 'Trigger', body: 'Problems asking for max/min in every sliding window of size k.' },
    ],
  },
];

export function getConceptById(id: string): Concept | undefined {
  return CONCEPTS.find(c => c.id === id);
}

export function getConceptsByCategory(category: ConceptCategory): Concept[] {
  return CONCEPTS.filter(c => c.category === category);
}

export const CONCEPT_CATEGORIES: ConceptCategory[] = [
  'COMPLEXITY', 'DATA_STRUCTURES', 'ALGORITHM_PATTERNS', 'INTERVIEW_TIPS',
];

export const CATEGORY_META: Record<ConceptCategory, { label: string; icon: string; color: string }> = {
  COMPLEXITY:          { label: 'Complexity',    icon: '📊', color: '#6C63FF' },
  DATA_STRUCTURES:     { label: 'Data Structures', icon: '🏗️', color: '#43C59E' },
  ALGORITHM_PATTERNS:  { label: 'Patterns',       icon: '🔄', color: '#FFB347' },
  INTERVIEW_TIPS:      { label: 'Interview Tips', icon: '🧠', color: '#FF6584' },
  MATH_FOUNDATIONS:    { label: 'Math',           icon: '∑',  color: '#A78BFA' },
};
