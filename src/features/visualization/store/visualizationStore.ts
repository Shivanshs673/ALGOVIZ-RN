import { create } from 'zustand';
import { VisualizationState, VisualizationStep, PlaybackSpeed, VizParams } from '../../../types/algorithm.types';
import { generateSteps, generateRandomArray } from '../engines/engineDispatcher';

interface VisualizationStore extends VisualizationState {
  searchTarget: number;
  searchTargetInput: string;
  kmpText: string;
  kmpPattern: string;
  trieWordsInput: string;
  bstTarget: number;
  bstTargetInput: string;
  loadAlgorithm: (algorithmId: string, inputArray?: number[]) => void;
  setCustomInput: (input: string) => void;
  setSearchTargetInput: (input: string) => void;
  setKmpText: (text: string) => void;
  setKmpPattern: (pattern: string) => void;
  setTrieWordsInput: (input: string) => void;
  setBstTargetInput: (input: string) => void;
  applyCustomInput: () => void;
  applyAllInputs: () => void;
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

function buildVizParams(state: VisualizationStore): VizParams {
  const words = state.trieWordsInput
    .split(/[,\s]+/)
    .map((w) => w.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 8);
  return {
    searchTarget: state.searchTarget,
    bstTarget: state.bstTarget,
    kmpText: state.kmpText.toUpperCase(),
    kmpPattern: state.kmpPattern.toUpperCase(),
    trieWords: words.length > 0 ? words : ['CAT', 'CAR', 'CARD', 'DOG'],
  };
}

function regenerateSteps(get: () => VisualizationStore): VisualizationStep[] {
  const state = get();
  if (!state.algorithmId) return [];
  return generateSteps(state.algorithmId, state.inputArray, buildVizParams(state));
}

export const useVisualizationStore = create<VisualizationStore>((set, get) => ({
  algorithmId: null,
  steps: [],
  currentStepIndex: 0,
  isPlaying: false,
  speed: 1,
  inputArray: DEFAULT_ARRAY,
  customInput: DEFAULT_ARRAY.join(', '),
  status: 'idle',
  searchTarget: DEFAULT_ARRAY[Math.floor(DEFAULT_ARRAY.length / 2)],
  searchTargetInput: String(DEFAULT_ARRAY[Math.floor(DEFAULT_ARRAY.length / 2)]),
  kmpText: 'ABABDABACDABABCABAB',
  kmpPattern: 'ABABCABAB',
  trieWordsInput: 'CAT, CAR, CARD, DOG',
  bstTarget: DEFAULT_ARRAY[Math.floor(DEFAULT_ARRAY.length / 2)],
  bstTargetInput: String(DEFAULT_ARRAY[Math.floor(DEFAULT_ARRAY.length / 2)]),

  loadAlgorithm: (algorithmId, inputArray) => {
    const arr = inputArray ?? get().inputArray;
    const mid = arr[Math.floor(arr.length / 2)] ?? 42;
    set({
      algorithmId,
      inputArray: arr,
      customInput: arr.join(', '),
      searchTarget: mid,
      searchTargetInput: String(mid),
      bstTarget: mid,
      bstTargetInput: String(mid),
      currentStepIndex: 0,
      isPlaying: false,
      status: 'idle',
    });
    const steps = generateSteps(algorithmId, arr, {
      ...buildVizParams(get()),
      searchTarget: mid,
      bstTarget: mid,
    });
    set({ steps, status: 'loaded' });
  },

  setCustomInput: (input) => set({ customInput: input }),
  setSearchTargetInput: (input) => set({ searchTargetInput: input }),
  setKmpText: (text) => set({ kmpText: text }),
  setKmpPattern: (pattern) => set({ kmpPattern: pattern }),
  setTrieWordsInput: (input) => set({ trieWordsInput: input }),
  setBstTargetInput: (input) => set({ bstTargetInput: input }),

  applyCustomInput: () => {
    const raw = get().customInput;
    const arr = raw.split(/[,\s]+/).map(Number).filter((n) => !isNaN(n) && n > 0).slice(0, 15);
    if (arr.length < 2) return;
    const mid = arr[Math.floor(arr.length / 2)];
    set({
      inputArray: arr,
      searchTarget: mid,
      searchTargetInput: String(mid),
      bstTarget: mid,
      bstTargetInput: String(mid),
    });
    const steps = regenerateSteps(get);
    set({ steps, currentStepIndex: 0, isPlaying: false, status: 'loaded' });
  },

  applyAllInputs: () => {
    const raw = get().customInput;
    const arr = raw.split(/[,\s]+/).map(Number).filter((n) => !isNaN(n) && n > 0).slice(0, 15);
    const targetNum = Number(get().searchTargetInput);
    const bstNum = Number(get().bstTargetInput);
    const patch: Partial<VisualizationStore> = {};
    if (arr.length >= 2) {
      patch.inputArray = arr;
      patch.customInput = arr.join(', ');
    }
    if (!isNaN(targetNum) && targetNum > 0) patch.searchTarget = targetNum;
    if (!isNaN(bstNum) && bstNum > 0) patch.bstTarget = bstNum;
    set(patch);
    const steps = regenerateSteps(get);
    set({ steps, currentStepIndex: 0, isPlaying: false, status: 'loaded' });
  },

  play: () => {
    const { steps, currentStepIndex } = get();
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

  reset: () => set({ currentStepIndex: 0, isPlaying: false, status: 'loaded' }),

  setSpeed: (speed) => set({ speed }),

  randomize: () => {
    const id = get().algorithmId;
    const size = get().inputArray.length;
    const arr = generateRandomArray(size);
    const mid = arr[Math.floor(arr.length / 2)];
    set({
      inputArray: arr,
      customInput: arr.join(', '),
      searchTarget: mid,
      searchTargetInput: String(mid),
      bstTarget: mid,
      bstTargetInput: String(mid),
    });
    if (id) {
      const steps = regenerateSteps(get);
      set({ steps, currentStepIndex: 0, isPlaying: false, status: 'loaded' });
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

export function useCurrentStep(): VisualizationStep | null {
  const steps = useVisualizationStore((s) => s.steps);
  const index = useVisualizationStore((s) => s.currentStepIndex);
  return steps[index] ?? null;
}

export function useVisualizationProgress(): number {
  const steps = useVisualizationStore((s) => s.steps);
  const index = useVisualizationStore((s) => s.currentStepIndex);
  if (steps.length <= 1) return 0;
  return index / (steps.length - 1);
}
