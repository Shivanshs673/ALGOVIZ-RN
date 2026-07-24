# Sorting Algorithms — Step Generator Engine
**File path in RN project:** `src/features/visualization/engines/SortingEngine.ts`

All functions return `VisualizationStep[]` — an ordered list of snapshots the visualizer plays back.

---

```typescript
import { VisualizationStep } from '../../../types/algorithm.types';

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────

function makeStep(
  array: number[],
  overrides: Partial<VisualizationStep>,
  comparisons: number,
  swaps: number
): VisualizationStep {
  return {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: [],
    message: '',
    comparisons,
    swaps,
    stepType: 'info',
    ...overrides,
  };
}

// ─────────────────────────────────────────────
// 1. BUBBLE SORT
// ─────────────────────────────────────────────

export function generateBubbleSortSteps(input: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const arr = [...input];
  let comparisons = 0;
  let swaps = 0;
  const sorted: number[] = [];

  steps.push(makeStep(arr, { message: 'Starting Bubble Sort', stepType: 'info' }, 0, 0));

  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      comparisons++;
      steps.push(makeStep(arr, {
        comparing: [j, j + 1],
        sorted: [...sorted],
        message: `Comparing ${arr[j]} and ${arr[j + 1]}`,
        stepType: 'compare',
        comparisons,
        swaps,
      }, comparisons, swaps));

      if (arr[j] > arr[j + 1]) {
        swaps++;
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        steps.push(makeStep(arr, {
          swapping: [j, j + 1],
          sorted: [...sorted],
          message: `Swapped: arr[${j}]=${arr[j]} and arr[${j + 1}]=${arr[j + 1]}`,
          stepType: 'swap',
          comparisons,
          swaps,
        }, comparisons, swaps));
      }
    }
    sorted.unshift(arr.length - 1 - i);
    steps.push(makeStep(arr, {
      sorted: [...sorted],
      message: `Position ${arr.length - 1 - i} is now sorted (value: ${arr[arr.length - 1 - i]})`,
      stepType: 'sorted',
      comparisons,
      swaps,
    }, comparisons, swaps));
  }
  sorted.unshift(0);
  steps.push(makeStep(arr, {
    sorted: arr.map((_, i) => i),
    message: `Bubble Sort complete! ${comparisons} comparisons, ${swaps} swaps.`,
    stepType: 'complete',
    comparisons,
    swaps,
  }, comparisons, swaps));

  return steps;
}

// ─────────────────────────────────────────────
// 2. SELECTION SORT
// ─────────────────────────────────────────────

export function generateSelectionSortSteps(input: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const arr = [...input];
  let comparisons = 0;
  let swaps = 0;
  const sorted: number[] = [];

  steps.push(makeStep(arr, { message: 'Starting Selection Sort', stepType: 'info' }, 0, 0));

  for (let i = 0; i < arr.length - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < arr.length; j++) {
      comparisons++;
      steps.push(makeStep(arr, {
        comparing: [minIndex, j],
        sorted: [...sorted],
        message: `Comparing current min ${arr[minIndex]} with ${arr[j]}`,
        stepType: 'compare',
        comparisons,
        swaps,
      }, comparisons, swaps));
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
        steps.push(makeStep(arr, {
          comparing: [minIndex],
          sorted: [...sorted],
          message: `New minimum found: ${arr[minIndex]} at index ${minIndex}`,
          stepType: 'info',
          comparisons,
          swaps,
        }, comparisons, swaps));
      }
    }
    if (minIndex !== i) {
      swaps++;
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
      steps.push(makeStep(arr, {
        swapping: [i, minIndex],
        sorted: [...sorted],
        message: `Placing minimum ${arr[i]} at position ${i}`,
        stepType: 'swap',
        comparisons,
        swaps,
      }, comparisons, swaps));
    }
    sorted.push(i);
  }
  sorted.push(arr.length - 1);
  steps.push(makeStep(arr, {
    sorted: arr.map((_, i) => i),
    message: `Selection Sort complete! ${comparisons} comparisons, ${swaps} swaps.`,
    stepType: 'complete',
    comparisons,
    swaps,
  }, comparisons, swaps));

  return steps;
}

// ─────────────────────────────────────────────
// 3. INSERTION SORT
// ─────────────────────────────────────────────

export function generateInsertionSortSteps(input: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const arr = [...input];
  let comparisons = 0;
  let swaps = 0;

  steps.push(makeStep(arr, { message: 'Starting Insertion Sort. First element is trivially sorted.', stepType: 'info', sorted: [0] }, 0, 0));

  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    steps.push(makeStep(arr, {
      comparing: [i],
      sorted: Array.from({ length: i }, (_, k) => k),
      message: `Picking key = ${key} at index ${i}`,
      stepType: 'info',
      comparisons,
      swaps,
    }, comparisons, swaps));

    while (j >= 0 && arr[j] > key) {
      comparisons++;
      arr[j + 1] = arr[j];
      swaps++;
      steps.push(makeStep(arr, {
        swapping: [j, j + 1],
        sorted: Array.from({ length: i }, (_, k) => k),
        message: `Shifting ${arr[j]} right to make space for ${key}`,
        stepType: 'swap',
        comparisons,
        swaps,
      }, comparisons, swaps));
      j--;
    }
    comparisons++;
    arr[j + 1] = key;
    steps.push(makeStep(arr, {
      comparing: [j + 1],
      sorted: Array.from({ length: i + 1 }, (_, k) => k),
      message: `Inserted ${key} at index ${j + 1}`,
      stepType: 'sorted',
      comparisons,
      swaps,
    }, comparisons, swaps));
  }

  steps.push(makeStep(arr, {
    sorted: arr.map((_, i) => i),
    message: `Insertion Sort complete! ${comparisons} comparisons, ${swaps} swaps.`,
    stepType: 'complete',
    comparisons,
    swaps,
  }, comparisons, swaps));

  return steps;
}

// ─────────────────────────────────────────────
// 4. MERGE SORT
// ─────────────────────────────────────────────

export function generateMergeSortSteps(input: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const arr = [...input];
  let comparisons = 0;
  let swaps = 0;

  function merge(arr: number[], left: number, mid: number, right: number) {
    const L = arr.slice(left, mid + 1);
    const R = arr.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;

    steps.push(makeStep(arr, {
      comparing: Array.from({ length: right - left + 1 }, (_, x) => left + x),
      message: `Merging [${L.join(',')}] and [${R.join(',')}]`,
      stepType: 'info',
      comparisons,
      swaps,
    }, comparisons, swaps));

    while (i < L.length && j < R.length) {
      comparisons++;
      if (L[i] <= R[j]) {
        arr[k] = L[i]; i++;
      } else {
        arr[k] = R[j]; j++;
      }
      swaps++;
      steps.push(makeStep(arr, {
        swapping: [k],
        message: `Placing ${arr[k]} at position ${k}`,
        stepType: 'swap',
        comparisons,
        swaps,
      }, comparisons, swaps));
      k++;
    }
    while (i < L.length) { arr[k++] = L[i++]; swaps++; }
    while (j < R.length) { arr[k++] = R[j++]; swaps++; }

    steps.push(makeStep(arr, {
      sorted: Array.from({ length: right - left + 1 }, (_, x) => left + x),
      message: `Merged section [${left}..${right}] successfully`,
      stepType: 'sorted',
      comparisons,
      swaps,
    }, comparisons, swaps));
  }

  function mergeSortHelper(arr: number[], left: number, right: number) {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      steps.push(makeStep(arr, {
        message: `Dividing [${left}..${right}] at mid=${mid}`,
        stepType: 'info',
        comparisons,
        swaps,
      }, comparisons, swaps));
      mergeSortHelper(arr, left, mid);
      mergeSortHelper(arr, mid + 1, right);
      merge(arr, left, mid, right);
    }
  }

  steps.push(makeStep(arr, { message: 'Starting Merge Sort', stepType: 'info' }, 0, 0));
  mergeSortHelper(arr, 0, arr.length - 1);
  steps.push(makeStep(arr, {
    sorted: arr.map((_, i) => i),
    message: `Merge Sort complete! ${comparisons} comparisons, ${swaps} merges.`,
    stepType: 'complete',
    comparisons,
    swaps,
  }, comparisons, swaps));

  return steps;
}

// ─────────────────────────────────────────────
// 5. QUICK SORT
// ─────────────────────────────────────────────

export function generateQuickSortSteps(input: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const arr = [...input];
  let comparisons = 0;
  let swaps = 0;
  const sortedSet = new Set<number>();

  function partition(arr: number[], low: number, high: number): number {
    const pivot = arr[high];
    steps.push(makeStep(arr, {
      pivotIndex: high,
      message: `Pivot = ${pivot} at index ${high}`,
      stepType: 'info',
      comparisons,
      swaps,
    }, comparisons, swaps));

    let i = low - 1;
    for (let j = low; j < high; j++) {
      comparisons++;
      steps.push(makeStep(arr, {
        comparing: [j, high],
        pivotIndex: high,
        message: `Comparing ${arr[j]} with pivot ${pivot}`,
        stepType: 'compare',
        comparisons,
        swaps,
      }, comparisons, swaps));

      if (arr[j] <= pivot) {
        i++;
        if (i !== j) {
          swaps++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          steps.push(makeStep(arr, {
            swapping: [i, j],
            pivotIndex: high,
            message: `Swapping ${arr[i]} and ${arr[j]}`,
            stepType: 'swap',
            comparisons,
            swaps,
          }, comparisons, swaps));
        }
      }
    }
    swaps++;
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    steps.push(makeStep(arr, {
      swapping: [i + 1, high],
      message: `Placing pivot ${pivot} at final position ${i + 1}`,
      stepType: 'sorted',
      comparisons,
      swaps,
    }, comparisons, swaps));
    sortedSet.add(i + 1);
    return i + 1;
  }

  function quickSortHelper(arr: number[], low: number, high: number) {
    if (low < high) {
      const pi = partition(arr, low, high);
      quickSortHelper(arr, low, pi - 1);
      quickSortHelper(arr, pi + 1, high);
    } else if (low === high) {
      sortedSet.add(low);
    }
  }

  steps.push(makeStep(arr, { message: 'Starting Quick Sort', stepType: 'info' }, 0, 0));
  quickSortHelper(arr, 0, arr.length - 1);
  steps.push(makeStep(arr, {
    sorted: arr.map((_, i) => i),
    message: `Quick Sort complete! ${comparisons} comparisons, ${swaps} swaps.`,
    stepType: 'complete',
    comparisons,
    swaps,
  }, comparisons, swaps));

  return steps;
}

// ─────────────────────────────────────────────
// 6. HEAP SORT
// ─────────────────────────────────────────────

export function generateHeapSortSteps(input: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const arr = [...input];
  let comparisons = 0;
  let swaps = 0;

  function heapify(arr: number[], n: number, i: number) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n) { comparisons++; if (arr[left] > arr[largest]) largest = left; }
    if (right < n) { comparisons++; if (arr[right] > arr[largest]) largest = right; }

    if (largest !== i) {
      swaps++;
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      steps.push(makeStep(arr, {
        swapping: [i, largest],
        message: `Heapify: swapping ${arr[i]} and ${arr[largest]}`,
        stepType: 'swap',
        comparisons,
        swaps,
      }, comparisons, swaps));
      heapify(arr, n, largest);
    }
  }

  steps.push(makeStep(arr, { message: 'Building Max Heap...', stepType: 'info' }, 0, 0));
  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) heapify(arr, arr.length, i);
  steps.push(makeStep(arr, { message: 'Max Heap built! Now extracting elements.', stepType: 'info' }, comparisons, swaps));

  const sorted: number[] = [];
  for (let i = arr.length - 1; i > 0; i--) {
    swaps++;
    [arr[0], arr[i]] = [arr[i], arr[0]];
    sorted.unshift(i);
    steps.push(makeStep(arr, {
      swapping: [0, i],
      sorted: [...sorted],
      message: `Extracting max ${arr[i]}, placing at position ${i}`,
      stepType: 'sorted',
      comparisons,
      swaps,
    }, comparisons, swaps));
    heapify(arr, i, 0);
  }
  sorted.unshift(0);
  steps.push(makeStep(arr, {
    sorted: arr.map((_, i) => i),
    message: `Heap Sort complete! ${comparisons} comparisons, ${swaps} swaps.`,
    stepType: 'complete',
    comparisons,
    swaps,
  }, comparisons, swaps));

  return steps;
}

// ─────────────────────────────────────────────
// 7. SHELL SORT
// ─────────────────────────────────────────────

export function generateShellSortSteps(input: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const arr = [...input];
  let comparisons = 0;
  let swaps = 0;

  steps.push(makeStep(arr, { message: 'Starting Shell Sort', stepType: 'info' }, 0, 0));

  let gap = Math.floor(arr.length / 2);
  while (gap > 0) {
    steps.push(makeStep(arr, { message: `Using gap = ${gap}`, stepType: 'info' }, comparisons, swaps));
    for (let i = gap; i < arr.length; i++) {
      const temp = arr[i];
      let j = i;
      while (j >= gap && arr[j - gap] > temp) {
        comparisons++;
        arr[j] = arr[j - gap];
        swaps++;
        steps.push(makeStep(arr, {
          swapping: [j, j - gap],
          message: `Gap=${gap}: shifting ${arr[j - gap]} right`,
          stepType: 'swap',
          comparisons,
          swaps,
        }, comparisons, swaps));
        j -= gap;
      }
      comparisons++;
      arr[j] = temp;
    }
    gap = Math.floor(gap / 2);
  }

  steps.push(makeStep(arr, {
    sorted: arr.map((_, i) => i),
    message: `Shell Sort complete! ${comparisons} comparisons, ${swaps} swaps.`,
    stepType: 'complete',
    comparisons,
    swaps,
  }, comparisons, swaps));

  return steps;
}

// ─────────────────────────────────────────────
// 8. COUNTING SORT
// ─────────────────────────────────────────────

export function generateCountingSortSteps(input: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const arr = [...input];
  let comparisons = 0;
  let swaps = 0;

  const max = Math.max(...arr);
  const count = new Array(max + 1).fill(0);

  steps.push(makeStep(arr, { message: `Max value = ${max}. Building count array...`, stepType: 'info' }, 0, 0));

  for (let i = 0; i < arr.length; i++) {
    count[arr[i]]++;
    steps.push(makeStep(arr, {
      comparing: [i],
      message: `Counted: ${arr[i]} → count[${arr[i]}] = ${count[arr[i]]}`,
      stepType: 'compare',
      comparisons: ++comparisons,
      swaps,
    }, comparisons, swaps));
  }

  // Prefix sum
  for (let i = 1; i <= max; i++) count[i] += count[i - 1];

  // Build output
  const output = new Array(arr.length);
  for (let j = arr.length - 1; j >= 0; j--) {
    output[count[arr[j]] - 1] = arr[j];
    count[arr[j]]--;
    swaps++;
  }

  for (let i = 0; i < arr.length; i++) arr[i] = output[i];

  steps.push(makeStep(arr, {
    sorted: arr.map((_, i) => i),
    message: `Counting Sort complete! ${comparisons} comparisons.`,
    stepType: 'complete',
    comparisons,
    swaps,
  }, comparisons, swaps));

  return steps;
}

// ─────────────────────────────────────────────
// 9. RADIX SORT
// ─────────────────────────────────────────────

export function generateRadixSortSteps(input: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const arr = [...input];
  let comparisons = 0;
  let swaps = 0;

  const max = Math.max(...arr);

  steps.push(makeStep(arr, { message: `Starting Radix Sort. Max = ${max}`, stepType: 'info' }, 0, 0));

  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const output = new Array(arr.length).fill(0);
    const count = new Array(10).fill(0);

    steps.push(makeStep(arr, { message: `Sorting by digit at position 10^${Math.log10(exp)}`, stepType: 'info' }, comparisons, swaps));

    for (let i = 0; i < arr.length; i++) {
      const digit = Math.floor(arr[i] / exp) % 10;
      count[digit]++;
      comparisons++;
    }
    for (let i = 1; i < 10; i++) count[i] += count[i - 1];
    for (let i = arr.length - 1; i >= 0; i--) {
      const digit = Math.floor(arr[i] / exp) % 10;
      output[count[digit] - 1] = arr[i];
      count[digit]--;
      swaps++;
    }
    for (let i = 0; i < arr.length; i++) arr[i] = output[i];

    steps.push(makeStep(arr, {
      message: `After digit pass (exp=${exp}): [${arr.join(', ')}]`,
      stepType: 'sorted',
      comparisons,
      swaps,
    }, comparisons, swaps));
  }

  steps.push(makeStep(arr, {
    sorted: arr.map((_, i) => i),
    message: `Radix Sort complete!`,
    stepType: 'complete',
    comparisons,
    swaps,
  }, comparisons, swaps));

  return steps;
}

// ─────────────────────────────────────────────
// DISPATCHER — call by algorithm id
// ─────────────────────────────────────────────

export function getSortingSteps(algorithmId: string, input: number[]): VisualizationStep[] {
  switch (algorithmId) {
    case 'bubble-sort':    return generateBubbleSortSteps(input);
    case 'selection-sort': return generateSelectionSortSteps(input);
    case 'insertion-sort': return generateInsertionSortSteps(input);
    case 'merge-sort':     return generateMergeSortSteps(input);
    case 'quick-sort':     return generateQuickSortSteps(input);
    case 'heap-sort':      return generateHeapSortSteps(input);
    case 'shell-sort':     return generateShellSortSteps(input);
    case 'counting-sort':  return generateCountingSortSteps(input);
    case 'radix-sort':     return generateRadixSortSteps(input);
    default: return [];
  }
}
```
