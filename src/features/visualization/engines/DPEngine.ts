import { VisualizationStep } from '../../../types/algorithm.types';
import { generateFibonacciDPSteps } from './AdditionalEngines';

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
        steps.push({ matrix: dp.map(r => [...r]), highlightCells: [[i, j]], message: `X[${i-1}]=${X[i-1]} == Y[${j-1}]=${Y[j-1]} → dp[${i}][${j}] = dp[${i-1}][${j-1}] + 1 = ${dp[i][j]}`, comparisons, swaps: 0, stepType: 'compare' });
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        steps.push({ matrix: dp.map(r => [...r]), highlightCells: [[i, j]], message: `X[${i-1}]=${X[i-1]} ≠ Y[${j-1}]=${Y[j-1]} → dp[${i}][${j}] = max(${dp[i-1][j]},${dp[i][j-1]}) = ${dp[i][j]}`, comparisons, swaps: 0, stepType: 'info' });
      }
    }
  }
  steps.push({ matrix: dp.map(r => [...r]), message: `LCS length = ${dp[m][n]}`, comparisons, swaps: 0, stepType: 'complete' });
  return steps;
}

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

export function getDPSteps(algorithmId: string, arr: number[]): VisualizationStep[] {
  switch (algorithmId) {
    case 'lcs': return generateLCSSteps(arr.slice(0, 4), arr.slice(4));
    case 'knapsack': return generateKnapsackSteps(10, [2, 3, 4, 5], [3, 4, 5, 6]);
    case 'lis': return generateLISSteps(arr);
    case 'coin-change': return generateCoinChangeSteps(arr, arr.reduce((s, x) => s + x, 0) / 3 | 0);
    case 'fibonacci-dp':
      return generateFibonacciDPSteps(Math.min(10, Math.max(3, arr.length)));
    case 'matrix-chain': return generateLCSSteps(arr.slice(0, 4), arr.slice(4));
    default: return [];
  }
}
