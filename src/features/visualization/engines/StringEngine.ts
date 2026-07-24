import { VisualizationStep, TrieVizNode, VizParams } from '../../../types/algorithm.types';

export function generateKMPSteps(
  text: string = 'ABABDABACDABABCABAB',
  pattern: string = 'ABABCABAB',
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = text.length;
  const m = pattern.length;
  if (m === 0 || n === 0) {
    return [{
      array: [],
      message: 'Enter text and pattern to search',
      comparisons: 0,
      swaps: 0,
      stepType: 'info',
    }];
  }

  const lps = buildLPS(pattern);
  let comparisons = 0;
  let i = 0;
  let j = 0;
  const textCodes = [...text].map((c) => c.charCodeAt(0) - 64);

  steps.push({
    array: textCodes,
    message: `KMP: search pattern "${pattern}" in text "${text}"`,
    comparisons: 0,
    swaps: 0,
    stepType: 'info',
  });

  steps.push({
    array: lps,
    message: `LPS (failure) array: [${lps.join(', ')}]`,
    comparisons: 0,
    swaps: 0,
    stepType: 'info',
  });

  while (i < n) {
    comparisons++;
    steps.push({
      array: textCodes,
      comparing: [i],
      searchTarget: j,
      message: `Compare text[${i}]='${text[i]}' with pattern[${j}]='${pattern[j] ?? '?'}'`,
      comparisons,
      swaps: 0,
      stepType: 'compare',
    });

    if (text[i] === pattern[j]) {
      i++;
      j++;
      if (j === m) {
        steps.push({
          array: textCodes,
          found: i - m,
          message: `Pattern found at index ${i - m}!`,
          comparisons,
          swaps: 0,
          stepType: 'found',
        });
        j = lps[j - 1];
      }
    } else if (j > 0) {
      j = lps[j - 1];
      steps.push({
        array: textCodes,
        comparing: [i],
        message: `Mismatch — jump using LPS to j=${j}`,
        comparisons,
        swaps: 0,
        stepType: 'info',
      });
    } else {
      i++;
    }
  }

  steps.push({
    array: textCodes,
    message: 'KMP search complete',
    comparisons,
    swaps: 0,
    stepType: 'complete',
  });
  return steps;
}

function buildLPS(pattern: string): number[] {
  const lps = new Array(pattern.length).fill(0);
  let len = 0;
  let i = 1;
  while (i < pattern.length) {
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      i++;
    } else if (len > 0) {
      len = lps[len - 1];
    } else {
      lps[i] = 0;
      i++;
    }
  }
  return lps;
}

type TrieNode = {
  id: string;
  char: string;
  children: Map<string, TrieNode>;
  isEnd: boolean;
  state: TrieVizNode['state'];
};

function layoutTrieNodes(root: TrieNode): TrieVizNode[] {
  const nodes: TrieVizNode[] = [];
  const rootId = root.id;

  function walk(node: TrieNode, depth: number, index: number, siblingCount: number, parentId?: string) {
    const spread = Math.max(60, siblingCount * 55);
    const x = 200 + (index - (siblingCount - 1) / 2) * spread;
    const y = 40 + depth * 70;
    nodes.push({
      id: node.id,
      char: node.char,
      x,
      y,
      state: node.state,
      isEnd: node.isEnd,
      parentId,
    });
    const children = [...node.children.values()];
    children.forEach((child, i) => walk(child, depth + 1, i, children.length, node.id));
  }

  nodes.push({
    id: rootId,
    char: root.char,
    x: 200,
    y: 40,
    state: root.state,
    isEnd: root.isEnd,
  });
  const children = [...root.children.values()];
  children.forEach((child, i) => walk(child, 1, i, children.length, rootId));
  return nodes;
}

export function generateTrieSteps(words: string[] = ['CAT', 'CAR', 'CARD', 'DOG']): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let idCounter = 0;
  let comparisons = 0;

  const root: TrieNode = {
    id: 'root',
    char: '∅',
    children: new Map(),
    isEnd: false,
    state: 'default',
  };

  steps.push({
    trieNodes: layoutTrieNodes(root),
    message: 'Trie: empty root — insert words one character at a time',
    comparisons: 0,
    swaps: 0,
    stepType: 'info',
  });

  for (const word of words) {
    let node = root;
    for (const ch of word.toUpperCase()) {
      comparisons++;
      if (!node.children.has(ch)) {
        const child: TrieNode = {
          id: `n${++idCounter}`,
          char: ch,
          children: new Map(),
          isEnd: false,
          state: 'visiting',
        };
        node.children.set(ch, child);
        node = child;
        steps.push({
          trieNodes: layoutTrieNodes(root),
          message: `Insert '${ch}' — new branch for "${word}"`,
          comparisons,
          swaps: 0,
          stepType: 'insert',
        });
        node.state = 'visited';
      } else {
        node = node.children.get(ch)!;
        node.state = 'visiting';
        steps.push({
          trieNodes: layoutTrieNodes(root),
          message: `Reuse '${ch}' prefix while inserting "${word}"`,
          comparisons,
          swaps: 0,
          stepType: 'visit',
        });
        node.state = 'visited';
      }
    }
    node.isEnd = true;
    node.state = 'found';
    steps.push({
      trieNodes: layoutTrieNodes(root),
      message: `Mark end of word "${word}" (bold ring)`,
      comparisons,
      swaps: 0,
      stepType: 'complete',
    });
    node.state = 'visited';
  }

  steps.push({
    trieNodes: layoutTrieNodes(root),
    message: `Trie built with ${words.length} word(s): ${words.join(', ')}`,
    comparisons,
    swaps: 0,
    stepType: 'complete',
  });
  return steps;
}

export function generateNaiveStringMatchSteps(text: string, pattern: string): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = text.length;
  const m = pattern.length;
  let comparisons = 0;
  const textCodes = [...text].map((c) => c.charCodeAt(0) - 64);

  steps.push({
    array: textCodes,
    message: `Naive search: find "${pattern}" in "${text}"`,
    comparisons: 0,
    swaps: 0,
    stepType: 'info',
  });

  for (let i = 0; i <= n - m; i++) {
    let j = 0;
    while (j < m && text[i + j] === pattern[j]) {
      comparisons++;
      j++;
    }
    comparisons++;
    steps.push({
      array: textCodes,
      comparing: Array.from({ length: m }, (_, k) => i + k).filter((x) => x < n),
      message: j === m ? `Match at index ${i}!` : `Shift window to index ${i + 1}`,
      comparisons,
      swaps: 0,
      stepType: j === m ? 'found' : 'compare',
    });
    if (j === m) break;
  }

  steps.push({
    array: textCodes,
    message: 'Naive string search complete',
    comparisons,
    swaps: 0,
    stepType: 'complete',
  });
  return steps;
}

export function getStringSteps(algorithmId: string, params: VizParams = {}): VisualizationStep[] {
  const text = (params.kmpText ?? 'ABABDABACDABABCABAB').toUpperCase();
  const pattern = (params.kmpPattern ?? 'ABABCABAB').toUpperCase();
  switch (algorithmId) {
    case 'kmp':
      return generateKMPSteps(text, pattern);
    case 'trie':
      return generateTrieSteps(params.trieWords ?? ['CAT', 'CAR', 'CARD', 'DOG']);
    case 'naive-string-match':
      return generateNaiveStringMatchSteps(text, pattern);
    case 'rabin-karp':
      return generateNaiveStringMatchSteps(text, pattern);
    default:
      return [];
  }
}
