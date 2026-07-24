# Visualization — Zustand Store + Playback Hook
**Files:**
- `src/features/visualization/store/visualizationStore.ts`
- `src/features/visualization/hooks/useVisualization.ts`
- `src/features/visualization/hooks/usePlaybackTimer.ts`

---

## visualizationStore.ts

```typescript
import { create } from 'zustand';
import { VisualizationState, VisualizationStep, PlaybackSpeed } from '../../../types/algorithm.types';
import { generateSteps, generateRandomArray } from '../engines/engineDispatcher';

interface VisualizationStore extends VisualizationState {
  // Actions
  loadAlgorithm: (algorithmId: string, inputArray?: number[]) => void;
  setCustomInput: (input: string) => void;
  applyCustomInput: () => void;
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBack: () => void;
  reset: () => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  randomize: () => void;
  setIsPlaying: (val: boolean) => void;
  goToStep: (index: number) => void;
}

const DEFAULT_ARRAY = [38, 27, 43, 3, 9, 82, 10, 17];

export const useVisualizationStore = create<VisualizationStore>((set, get) => ({
  // Initial state
  algorithmId: null,
  steps: [],
  currentStepIndex: 0,
  isPlaying: false,
  speed: 1,
  inputArray: DEFAULT_ARRAY,
  customInput: DEFAULT_ARRAY.join(', '),
  status: 'idle',

  // Load an algorithm and compute all steps
  loadAlgorithm: (algorithmId, inputArray) => {
    const arr = inputArray ?? get().inputArray;
    const steps = generateSteps(algorithmId, arr);
    set({
      algorithmId,
      steps,
      currentStepIndex: 0,
      isPlaying: false,
      status: 'loaded',
      inputArray: arr,
      customInput: arr.join(', '),
    });
  },

  setCustomInput: (input) => set({ customInput: input }),

  applyCustomInput: () => {
    const raw = get().customInput;
    const arr = raw.split(/[,\s]+/).map(Number).filter(n => !isNaN(n) && n > 0).slice(0, 15);
    if (arr.length < 2) return; // Need at least 2 elements
    const id = get().algorithmId;
    if (id) {
      const steps = generateSteps(id, arr);
      set({ inputArray: arr, steps, currentStepIndex: 0, isPlaying: false, status: 'loaded' });
    }
  },

  play: () => {
    const { status, steps, currentStepIndex } = get();
    if (steps.length === 0) return;
    if (currentStepIndex >= steps.length - 1) {
      set({ currentStepIndex: 0, isPlaying: true, status: 'playing' });
    } else {
      set({ isPlaying: true, status: 'playing' });
    }
  },

  pause: () => set({ isPlaying: false, status: 'paused' }),

  stepForward: () => {
    const { currentStepIndex, steps } = get();
    if (currentStepIndex < steps.length - 1) {
      const next = currentStepIndex + 1;
      const isLast = next === steps.length - 1;
      set({ currentStepIndex: next, isPlaying: false, status: isLast ? 'completed' : 'paused' });
    }
  },

  stepBack: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1, isPlaying: false, status: 'paused' });
    }
  },

  reset: () => {
    set({ currentStepIndex: 0, isPlaying: false, status: 'loaded' });
  },

  setSpeed: (speed) => set({ speed }),

  randomize: () => {
    const id = get().algorithmId;
    const size = get().inputArray.length;
    const arr = generateRandomArray(size);
    if (id) {
      const steps = generateSteps(id, arr);
      set({ inputArray: arr, steps, currentStepIndex: 0, isPlaying: false, status: 'loaded', customInput: arr.join(', ') });
    } else {
      set({ inputArray: arr, customInput: arr.join(', ') });
    }
  },

  setIsPlaying: (val) => set({ isPlaying: val }),

  goToStep: (index) => {
    const { steps } = get();
    if (index >= 0 && index < steps.length) {
      set({ currentStepIndex: index, isPlaying: false, status: 'paused' });
    }
  },
}));

// Derived selector — current visualization step
export function useCurrentStep(): VisualizationStep | null {
  const steps = useVisualizationStore(s => s.steps);
  const index = useVisualizationStore(s => s.currentStepIndex);
  return steps[index] ?? null;
}

// Derived selector — progress 0..1
export function useVisualizationProgress(): number {
  const steps = useVisualizationStore(s => s.steps);
  const index = useVisualizationStore(s => s.currentStepIndex);
  if (steps.length <= 1) return 0;
  return index / (steps.length - 1);
}
```

---

## usePlaybackTimer.ts

```typescript
import { useEffect, useRef } from 'react';
import { useVisualizationStore } from '../store/visualizationStore';
import { SPEED_DELAY_MS } from '../../../types/algorithm.types';

/**
 * Drives automatic playback. When isPlaying=true, this hook
 * advances currentStepIndex at the correct interval.
 */
export function usePlaybackTimer() {
  const isPlaying    = useVisualizationStore(s => s.isPlaying);
  const speed        = useVisualizationStore(s => s.speed);
  const stepForward  = useVisualizationStore(s => s.stepForward);
  const steps        = useVisualizationStore(s => s.steps);
  const currentIndex = useVisualizationStore(s => s.currentStepIndex);
  const pause        = useVisualizationStore(s => s.pause);
  const setIsPlaying = useVisualizationStore(s => s.setIsPlaying);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }

    const delay = SPEED_DELAY_MS[speed];
    timerRef.current = setInterval(() => {
      const idx = useVisualizationStore.getState().currentStepIndex;
      const total = useVisualizationStore.getState().steps.length;
      if (idx >= total - 1) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        useVisualizationStore.getState().pause();
      } else {
        useVisualizationStore.getState().stepForward();
        // Don't call pause here — let store handle status
        useVisualizationStore.setState({ isPlaying: true, status: 'playing' });
      }
    }, delay);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, speed]);

  // If completed, auto-stop
  useEffect(() => {
    if (currentIndex >= steps.length - 1 && isPlaying) {
      pause();
    }
  }, [currentIndex, steps.length]);
}
```

---

## useVisualization.ts

```typescript
import { useEffect } from 'react';
import { useVisualizationStore, useCurrentStep } from '../store/visualizationStore';
import { usePlaybackTimer } from './usePlaybackTimer';
import { getAlgorithmById } from '../../algorithms/data/algorithmRegistry';

/**
 * Main hook for the Visualization Screen.
 * Loads the algorithm, wires up the playback timer, and returns
 * everything the screen needs.
 */
export function useVisualization(algorithmId: string) {
  const store = useVisualizationStore();
  const currentStep = useCurrentStep();

  // Load algorithm on mount / when id changes
  useEffect(() => {
    if (algorithmId && algorithmId !== store.algorithmId) {
      store.loadAlgorithm(algorithmId);
    }
  }, [algorithmId]);

  // Wire up playback timer
  usePlaybackTimer();

  const algorithm = getAlgorithmById(algorithmId);

  return {
    // Algorithm metadata
    algorithm,

    // Playback state
    currentStep,
    currentStepIndex: store.currentStepIndex,
    totalSteps: store.steps.length,
    isPlaying: store.isPlaying,
    speed: store.speed,
    status: store.status,
    inputArray: store.inputArray,
    customInput: store.customInput,

    // Progress
    progress: store.steps.length > 1 ? store.currentStepIndex / (store.steps.length - 1) : 0,

    // Actions
    play: store.play,
    pause: store.pause,
    stepForward: store.stepForward,
    stepBack: store.stepBack,
    reset: store.reset,
    setSpeed: store.setSpeed,
    randomize: store.randomize,
    setCustomInput: store.setCustomInput,
    applyCustomInput: store.applyCustomInput,
    goToStep: store.goToStep,
  };
}
```
