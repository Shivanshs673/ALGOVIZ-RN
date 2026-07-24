import { VisualizationStep } from '../../../types/algorithm.types';
import { generateTernarySearchSteps, generateBucketSortSteps } from './AdditionalEngines';

export function generateLinearSearchSteps(arr: number[], target: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let comparisons = 0;
  steps.push({
    array: [...arr],
    searchTarget: target,
    message: `Linear Search for ${target}`,
    comparisons: 0,
    swaps: 0,
    stepType: 'info',
  });
  for (let i = 0; i < arr.length; i++) {
    comparisons++;
    steps.push({
      array: [...arr],
      comparing: [i],
      searchTarget: target,
      message: `Checking arr[${i}] = ${arr[i]}`,
      comparisons,
      swaps: 0,
      stepType: 'compare',
    });
    if (arr[i] === target) {
      steps.push({
        array: [...arr],
        found: i,
        searchTarget: target,
        message: `Found ${target} at index ${i}!`,
        comparisons,
        swaps: 0,
        stepType: 'found',
      });
      return steps;
    }
  }
  steps.push({
    array: [...arr],
    searchTarget: target,
    message: `${target} not found after ${comparisons} comparisons`,
    comparisons,
    swaps: 0,
    stepType: 'not_found',
  });
  return steps;
}

export function generateBinarySearchSteps(arr: number[], target: number): VisualizationStep[] {
  const sorted = [...arr].sort((a, b) => a - b);
  const steps: VisualizationStep[] = [];
  let left = 0;
  let right = sorted.length - 1;
  let comparisons = 0;
  steps.push({
    array: sorted,
    searchTarget: target,
    message: `Binary Search for ${target} in sorted array`,
    comparisons: 0,
    swaps: 0,
    stepType: 'info',
  });
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    comparisons++;
    steps.push({
      array: sorted,
      comparing: [left, mid, right],
      searchTarget: target,
      message: `left=${left}, right=${right}, mid=${mid} → arr[mid]=${sorted[mid]}`,
      comparisons,
      swaps: 0,
      stepType: 'compare',
    });
    if (sorted[mid] === target) {
      steps.push({
        array: sorted,
        found: mid,
        searchTarget: target,
        message: `Found ${target} at index ${mid}!`,
        comparisons,
        swaps: 0,
        stepType: 'found',
      });
      return steps;
    }
    if (sorted[mid] < target) {
      left = mid + 1;
      steps.push({
        array: sorted,
        comparing: [left, right],
        message: `${sorted[mid]} < ${target}, search right half`,
        comparisons,
        swaps: 0,
        stepType: 'info',
      });
    } else {
      right = mid - 1;
      steps.push({
        array: sorted,
        comparing: [left, right],
        message: `${sorted[mid]} > ${target}, search left half`,
        comparisons,
        swaps: 0,
        stepType: 'info',
      });
    }
  }
  steps.push({
    array: sorted,
    searchTarget: target,
    message: `${target} not found`,
    comparisons,
    swaps: 0,
    stepType: 'not_found',
  });
  return steps;
}

export function generateJumpSearchSteps(arr: number[], target: number): VisualizationStep[] {
  const sorted = [...arr].sort((a, b) => a - b);
  const steps: VisualizationStep[] = [];
  const n = sorted.length;
  const step = Math.floor(Math.sqrt(n)) || 1;
  let comparisons = 0;
  let prev = 0;

  steps.push({
    array: sorted,
    searchTarget: target,
    message: `Jump Search for ${target} (block size √n = ${step})`,
    comparisons: 0,
    swaps: 0,
    stepType: 'info',
  });

  while (prev < n && sorted[Math.min(prev + step, n) - 1] < target) {
    comparisons++;
    const idx = Math.min(prev + step, n) - 1;
    steps.push({
      array: sorted,
      comparing: [prev, idx],
      searchTarget: target,
      message: `Jump: arr[${idx}]=${sorted[idx]} < ${target}, skip block`,
      comparisons,
      swaps: 0,
      stepType: 'compare',
    });
    prev += step;
  }

  const end = Math.min(prev + step, n);
  for (let i = prev; i < end; i++) {
    comparisons++;
    steps.push({
      array: sorted,
      comparing: [i],
      searchTarget: target,
      message: `Linear scan in block: arr[${i}]=${sorted[i]}`,
      comparisons,
      swaps: 0,
      stepType: 'compare',
    });
    if (sorted[i] === target) {
      steps.push({
        array: sorted,
        found: i,
        searchTarget: target,
        message: `Found ${target} at index ${i}!`,
        comparisons,
        swaps: 0,
        stepType: 'found',
      });
      return steps;
    }
  }

  steps.push({
    array: sorted,
    searchTarget: target,
    message: `${target} not found`,
    comparisons,
    swaps: 0,
    stepType: 'not_found',
  });
  return steps;
}

export function generateInterpolationSearchSteps(arr: number[], target: number): VisualizationStep[] {
  const sorted = [...arr].sort((a, b) => a - b);
  const steps: VisualizationStep[] = [];
  let low = 0;
  let high = sorted.length - 1;
  let comparisons = 0;

  steps.push({
    array: sorted,
    searchTarget: target,
    message: `Interpolation Search for ${target}`,
    comparisons: 0,
    swaps: 0,
    stepType: 'info',
  });

  while (low <= high && target >= sorted[low] && target <= sorted[high]) {
    if (low === high) {
      comparisons++;
      if (sorted[low] === target) {
        steps.push({
          array: sorted,
          found: low,
          searchTarget: target,
          message: `Found ${target} at index ${low}!`,
          comparisons,
          swaps: 0,
          stepType: 'found',
        });
        return steps;
      }
      break;
    }

    const pos = low + Math.floor(((high - low) / (sorted[high] - sorted[low])) * (target - sorted[low]));
    comparisons++;
    steps.push({
      array: sorted,
      comparing: [low, pos, high],
      searchTarget: target,
      message: `Probe pos=${pos} → arr[pos]=${sorted[pos]}`,
      comparisons,
      swaps: 0,
      stepType: 'compare',
    });

    if (sorted[pos] === target) {
      steps.push({
        array: sorted,
        found: pos,
        searchTarget: target,
        message: `Found ${target} at index ${pos}!`,
        comparisons,
        swaps: 0,
        stepType: 'found',
      });
      return steps;
    }
    if (sorted[pos] < target) {
      low = pos + 1;
      steps.push({
        array: sorted,
        comparing: [low, high],
        message: `${sorted[pos]} < ${target}, move low → ${low}`,
        comparisons,
        swaps: 0,
        stepType: 'info',
      });
    } else {
      high = pos - 1;
      steps.push({
        array: sorted,
        comparing: [low, high],
        message: `${sorted[pos]} > ${target}, move high → ${high}`,
        comparisons,
        swaps: 0,
        stepType: 'info',
      });
    }
  }

  steps.push({
    array: sorted,
    searchTarget: target,
    message: `${target} not found`,
    comparisons,
    swaps: 0,
    stepType: 'not_found',
  });
  return steps;
}

export function generateExponentialSearchSteps(arr: number[], target: number): VisualizationStep[] {
  const sorted = [...arr].sort((a, b) => a - b);
  const steps: VisualizationStep[] = [];
  let comparisons = 0;
  const n = sorted.length;

  steps.push({
    array: sorted,
    searchTarget: target,
    message: `Exponential Search for ${target}`,
    comparisons: 0,
    swaps: 0,
    stepType: 'info',
  });

  if (n === 0) {
    steps.push({
      array: sorted,
      searchTarget: target,
      message: 'Empty array',
      comparisons: 0,
      swaps: 0,
      stepType: 'not_found',
    });
    return steps;
  }

  if (sorted[0] === target) {
    steps.push({
      array: sorted,
      found: 0,
      searchTarget: target,
      message: `Found ${target} at index 0!`,
      comparisons: 1,
      swaps: 0,
      stepType: 'found',
    });
    return steps;
  }

  let bound = 1;
  while (bound < n && sorted[bound] < target) {
    comparisons++;
    steps.push({
      array: sorted,
      comparing: [bound],
      searchTarget: target,
      message: `Expand bound to ${bound}: arr[${bound}]=${sorted[bound]} < ${target}`,
      comparisons,
      swaps: 0,
      stepType: 'compare',
    });
    bound *= 2;
  }

  const left = Math.floor(bound / 2);
  const right = Math.min(bound, n - 1);
  steps.push({
    array: sorted,
    comparing: [left, right],
    searchTarget: target,
    message: `Binary search in range [${left}, ${right}]`,
    comparisons,
    swaps: 0,
    stepType: 'info',
  });

  const sub = sorted.slice(left, right + 1);
  const binarySteps = generateBinarySearchSteps(sub, target);
  for (const s of binarySteps.slice(1)) {
    const mappedComparing = s.comparing?.map((i) => i + left);
    const mappedFound = s.found !== undefined ? s.found + left : undefined;
    steps.push({
      ...s,
      array: sorted,
      comparing: mappedComparing,
      found: mappedFound,
      comparisons: comparisons + s.comparisons,
    });
  }

  return steps;
}

export function getSearchingSteps(algorithmId: string, arr: number[], target?: number): VisualizationStep[] {
  const t = target ?? arr[Math.floor(arr.length / 2)];
  switch (algorithmId) {
    case 'linear-search':
      return generateLinearSearchSteps(arr, t);
    case 'binary-search':
      return generateBinarySearchSteps(arr, t);
    case 'jump-search':
      return generateJumpSearchSteps(arr, t);
    case 'interpolation-search':
      return generateInterpolationSearchSteps(arr, t);
    case 'exponential-search':
      return generateExponentialSearchSteps(arr, t);
    case 'ternary-search':
      return generateTernarySearchSteps(arr, t);
    default:
      return [];
  }
}
