import { VisualizationStep } from '../../../types/algorithm.types';
import { generateFractionalKnapsackSteps } from './AdditionalEngines';

interface Activity {
  id: number;
  start: number;
  finish: number;
}

const DEFAULT_ACTIVITIES: Activity[] = [
  { id: 1, start: 1, finish: 4 },
  { id: 2, start: 3, finish: 5 },
  { id: 3, start: 0, finish: 6 },
  { id: 4, start: 5, finish: 7 },
  { id: 5, start: 8, finish: 9 },
  { id: 6, start: 5, finish: 9 },
];

export function generateActivitySelectionSteps(
  activities: Activity[] = DEFAULT_ACTIVITIES,
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const sorted = [...activities].sort((a, b) => a.finish - b.finish);
  const selected: number[] = [];
  let lastFinish = -Infinity;
  let comparisons = 0;

  const asArray = () => sorted.map((a) => a.id);

  steps.push({
    array: asArray(),
    message: 'Activity Selection: sort by finish time',
    comparisons: 0,
    swaps: 0,
    stepType: 'info',
  });

  for (let i = 0; i < sorted.length; i++) {
    comparisons++;
    const a = sorted[i];
    steps.push({
      array: asArray(),
      comparing: [i],
      sorted: [...selected],
      message: `Consider activity ${a.id} [${a.start},${a.finish}]`,
      comparisons,
      swaps: 0,
      stepType: 'compare',
    });

    if (a.start >= lastFinish) {
      selected.push(i);
      lastFinish = a.finish;
      steps.push({
        array: asArray(),
        sorted: [...selected],
        message: `Select activity ${a.id} (starts after previous finish)`,
        comparisons,
        swaps: 0,
        stepType: 'insert',
      });
    } else {
      steps.push({
        array: asArray(),
        comparing: [i],
        sorted: [...selected],
        message: `Skip activity ${a.id} — overlaps previous`,
        comparisons,
        swaps: 0,
        stepType: 'info',
      });
    }
  }

  steps.push({
    array: asArray(),
    sorted: [...selected],
    message: `Done! Selected ${selected.length} activities: ${selected.map((i) => sorted[i].id).join(', ')}`,
    comparisons,
    swaps: 0,
    stepType: 'complete',
  });
  return steps;
}

/** Simplified Huffman tree build as frequency-merge steps on an array of freqs */
export function generateHuffmanSteps(freqs: number[] = [5, 9, 12, 13, 16, 45]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let heap = [...freqs].sort((a, b) => a - b);
  let comparisons = 0;
  const merges: number[] = [];

  steps.push({
    array: [...heap],
    message: 'Huffman Coding: start with character frequencies',
    comparisons: 0,
    swaps: 0,
    stepType: 'info',
  });

  while (heap.length > 1) {
    comparisons++;
    const a = heap.shift()!;
    const b = heap.shift()!;
    const merged = a + b;
    merges.push(merged);
    steps.push({
      array: [...heap, merged],
      comparing: [0, 1],
      message: `Merge ${a} + ${b} → ${merged}`,
      comparisons,
      swaps: 0,
      stepType: 'process',
    });
    heap.push(merged);
    heap.sort((x, y) => x - y);
    steps.push({
      array: [...heap],
      sorted: heap.map((_, i) => i),
      message: `Re-sort frequencies: [${heap.join(', ')}]`,
      comparisons,
      swaps: 0,
      stepType: 'sorted',
    });
  }

  steps.push({
    array: [...heap],
    message: `Huffman tree complete. Root weight = ${heap[0]}`,
    comparisons,
    swaps: 0,
    stepType: 'complete',
  });
  return steps;
}

export function getGreedySteps(algorithmId: string, arr: number[] = []): VisualizationStep[] {
  switch (algorithmId) {
    case 'activity-selection':
      return generateActivitySelectionSteps();
    case 'huffman':
      return generateHuffmanSteps(arr.length >= 3 ? arr : undefined);
    case 'fractional-knapsack':
      return generateFractionalKnapsackSteps();
    default:
      return [];
  }
}
