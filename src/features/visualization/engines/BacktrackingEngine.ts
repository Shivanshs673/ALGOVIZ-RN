import { VisualizationStep } from '../../../types/algorithm.types';

export function generateNQueensSteps(n: number = 6): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const board: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));
  let stepCount = 0;

  function isSafe(row: number, col: number): boolean {
    for (let i = 0; i < row; i++) {
      if (board[i][col] === 1) return false;
      if (col - (row - i) >= 0 && board[i][col - (row - i)] === 1) return false;
      if (col + (row - i) < n && board[i][col + (row - i)] === 1) return false;
    }
    return true;
  }

  function solve(row: number): boolean {
    if (row === n) return true;
    for (let col = 0; col < n; col++) {
      if (stepCount > 200) return true;
      const safe = isSafe(row, col);
      steps.push({
        board: board.map((r) => [...r]),
        tryingPosition: [row, col],
        message: safe
          ? `Row ${row}: Trying queen at col ${col} — safe! ✓`
          : `Row ${row}: Col ${col} — conflict! ✗`,
        comparisons: ++stepCount,
        swaps: 0,
        stepType: safe ? 'compare' : 'info',
      });
      if (safe) {
        board[row][col] = 1;
        steps.push({
          board: board.map((r) => [...r]),
          message: `Placed queen at (${row}, ${col})`,
          comparisons: stepCount,
          swaps: 0,
          stepType: 'insert',
        });
        if (solve(row + 1)) return true;
        board[row][col] = null;
        steps.push({
          board: board.map((r) => [...r]),
          message: `Backtrack from (${row}, ${col})`,
          comparisons: stepCount,
          swaps: 0,
          stepType: 'info',
        });
      }
    }
    return false;
  }

  steps.push({
    board: board.map((r) => [...r]),
    message: `Solving ${n}-Queens Problem`,
    comparisons: 0,
    swaps: 0,
    stepType: 'info',
  });
  solve(0);
  steps.push({
    board: board.map((r) => [...r]),
    message: `${n}-Queens solved!`,
    comparisons: stepCount,
    swaps: 0,
    stepType: 'complete',
  });
  return steps;
}

/** Compact 4×4 puzzle for clear step visualization */
const DEFAULT_SUDOKU: number[][] = [
  [1, 0, 0, 4],
  [0, 0, 1, 0],
  [0, 1, 0, 0],
  [4, 0, 0, 1],
];

export function generateSudokuSteps(puzzle: number[][] = DEFAULT_SUDOKU): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = puzzle.length;
  const board: (number | null)[][] = puzzle.map((row) =>
    row.map((v) => (v === 0 ? null : v)),
  );
  let comparisons = 0;
  const maxSteps = 250;

  function isSafe(row: number, col: number, num: number): boolean {
    for (let i = 0; i < n; i++) {
      if (board[row][i] === num || board[i][col] === num) return false;
    }
    const box = Math.sqrt(n);
    const br = Math.floor(row / box) * box;
    const bc = Math.floor(col / box) * box;
    for (let r = br; r < br + box; r++) {
      for (let c = bc; c < bc + box; c++) {
        if (board[r][c] === num) return false;
      }
    }
    return true;
  }

  function findEmpty(): [number, number] | null {
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (board[r][c] === null) return [r, c];
      }
    }
    return null;
  }

  function solve(): boolean {
    if (comparisons > maxSteps) return true;
    const empty = findEmpty();
    if (!empty) return true;
    const [row, col] = empty;

    for (let num = 1; num <= n; num++) {
      comparisons++;
      const safe = isSafe(row, col, num);
      steps.push({
        board: board.map((r) => [...r]),
        tryingPosition: [row, col],
        message: safe
          ? `Try ${num} at (${row},${col}) — valid`
          : `Try ${num} at (${row},${col}) — conflict`,
        comparisons,
        swaps: 0,
        stepType: safe ? 'compare' : 'info',
      });
      if (safe) {
        board[row][col] = num;
        steps.push({
          board: board.map((r) => [...r]),
          message: `Place ${num} at (${row},${col})`,
          comparisons,
          swaps: 0,
          stepType: 'insert',
        });
        if (solve()) return true;
        board[row][col] = null;
        steps.push({
          board: board.map((r) => [...r]),
          message: `Backtrack — remove ${num} from (${row},${col})`,
          comparisons,
          swaps: 0,
          stepType: 'info',
        });
      }
    }
    return false;
  }

  steps.push({
    board: board.map((r) => [...r]),
    message: `Solving ${n}×${n} Sudoku`,
    comparisons: 0,
    swaps: 0,
    stepType: 'info',
  });
  solve();
  steps.push({
    board: board.map((r) => [...r]),
    message: 'Sudoku solved!',
    comparisons,
    swaps: 0,
    stepType: 'complete',
  });
  return steps;
}

export function getBacktrackingSteps(algorithmId: string): VisualizationStep[] {
  switch (algorithmId) {
    case 'n-queens':
      return generateNQueensSteps(6);
    case 'sudoku':
      return generateSudokuSteps();
    default:
      return [];
  }
}
