import { VisualizationStep, VizParams } from '../../../types/algorithm.types';

export function generateTernarySearchSteps(arr: number[], target: number): VisualizationStep[] {
  const sorted = [...arr].sort((a, b) => a - b);
  const steps: VisualizationStep[] = [];
  let left = 0;
  let right = sorted.length - 1;
  let comparisons = 0;

  steps.push({
    array: sorted,
    searchTarget: target,
    message: `Ternary Search for ${target}`,
    comparisons: 0,
    swaps: 0,
    stepType: 'info',
  });

  while (left <= right) {
    const mid1 = left + Math.floor((right - left) / 3);
    const mid2 = right - Math.floor((right - left) / 3);
    comparisons++;
    steps.push({
      array: sorted,
      comparing: [left, mid1, mid2, right],
      searchTarget: target,
      message: `Thirds: mid1=${mid1}(${sorted[mid1]}), mid2=${mid2}(${sorted[mid2]})`,
      comparisons,
      swaps: 0,
      stepType: 'compare',
    });

    if (sorted[mid1] === target) {
      steps.push({ array: sorted, found: mid1, searchTarget: target, message: `Found at ${mid1}!`, comparisons, swaps: 0, stepType: 'found' });
      return steps;
    }
    if (sorted[mid2] === target) {
      steps.push({ array: sorted, found: mid2, searchTarget: target, message: `Found at ${mid2}!`, comparisons, swaps: 0, stepType: 'found' });
      return steps;
    }
    if (target < sorted[mid1]) {
      right = mid1 - 1;
    } else if (target > sorted[mid2]) {
      left = mid2 + 1;
    } else {
      left = mid1 + 1;
      right = mid2 - 1;
    }
  }

  steps.push({ array: sorted, searchTarget: target, message: `${target} not found`, comparisons, swaps: 0, stepType: 'not_found' });
  return steps;
}

export function generateBucketSortSteps(input: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const arr = [...input];
  const max = Math.max(...arr);
  const bucketCount = Math.max(3, Math.ceil(Math.sqrt(arr.length)));
  let comparisons = 0;

  steps.push({ array: [...arr], message: `Bucket Sort with ${bucketCount} buckets`, comparisons: 0, swaps: 0, stepType: 'info' });

  const buckets: number[][] = Array.from({ length: bucketCount }, () => []);
  for (const x of arr) {
    const idx = Math.min(bucketCount - 1, Math.floor((x / (max + 1)) * bucketCount));
    buckets[idx].push(x);
    comparisons++;
    steps.push({
      array: [...arr],
      message: `Place ${x} into bucket ${idx}`,
      comparisons,
      swaps: 0,
      stepType: 'insert',
    });
  }

  let i = 0;
  const sorted: number[] = [];
  for (let b = 0; b < bucketCount; b++) {
    buckets[b].sort((a, c) => a - c);
    for (const x of buckets[b]) {
      sorted.push(x);
      arr[i++] = x;
      steps.push({ array: [...arr], sorted: [...sorted], message: `Collect ${x} from bucket ${b}`, comparisons, swaps: 0, stepType: 'sorted' });
    }
  }

  steps.push({ array: [...arr], sorted: [...arr], message: 'Bucket sort complete', comparisons, swaps: 0, stepType: 'complete' });
  return steps;
}

export function generateFibonacciDPSteps(n: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const dp: number[] = [0, 1];
  let comparisons = 0;

  steps.push({ array: [0, 1], message: `Fibonacci DP: F(0)=0, F(1)=1`, comparisons: 0, swaps: 0, stepType: 'info' });

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    comparisons++;
    steps.push({
      array: [...dp],
      message: `F(${i}) = F(${i - 1}) + F(${i - 2}) = ${dp[i]}`,
      comparisons,
      swaps: 0,
      stepType: 'process',
    });
  }

  steps.push({ array: [...dp], message: `Fibonacci(${n}) = ${dp[n]}`, comparisons, swaps: 0, stepType: 'complete' });
  return steps;
}

export function generateFractionalKnapsackSteps(): VisualizationStep[] {
  const items = [
    { id: 1, w: 10, v: 60, ratio: 6 },
    { id: 2, w: 20, v: 100, ratio: 5 },
    { id: 3, w: 30, v: 120, ratio: 4 },
  ];
  const capacity = 50;
  const steps: VisualizationStep[] = [];
  let comparisons = 0;
  let remaining = capacity;
  let value = 0;

  steps.push({
    array: items.map((i) => i.ratio),
    message: 'Fractional Knapsack: sort by value/weight ratio',
    comparisons: 0,
    swaps: 0,
    stepType: 'info',
  });

  for (const item of items) {
    comparisons++;
    const take = Math.min(remaining, item.w);
    const frac = take / item.w;
    value += item.v * frac;
    remaining -= take;
    steps.push({
      array: items.map((i) => i.ratio),
      comparing: [item.id - 1],
      message: `Take ${take}/${item.w} of item ${item.id} → +${(item.v * frac).toFixed(0)} value`,
      comparisons,
      swaps: 0,
      stepType: 'visit',
    });
    if (remaining <= 0) break;
  }

  steps.push({
    array: items.map((i) => i.ratio),
    message: `Max value = ${value.toFixed(0)} with capacity ${capacity}`,
    comparisons,
    swaps: 0,
    stepType: 'complete',
  });
  return steps;
}

export function getAdditionalSteps(algorithmId: string, arr: number[], params: VizParams): VisualizationStep[] {
  switch (algorithmId) {
    case 'ternary-search':
      return generateTernarySearchSteps(arr, params.searchTarget ?? arr[Math.floor(arr.length / 2)]);
    case 'bucket-sort':
      return generateBucketSortSteps(arr);
    case 'fibonacci-dp':
      return generateFibonacciDPSteps(Math.min(10, Math.max(3, arr.length)));
    case 'fractional-knapsack':
      return generateFractionalKnapsackSteps();
    default:
      return [];
  }
}
