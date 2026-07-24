import { useEffect } from 'react';
import { useVisualizationStore, useCurrentStep } from '../store/visualizationStore';
import { usePlaybackTimer } from './usePlaybackTimer';
import { getAlgorithmById } from '../../algorithms/data/algorithmRegistry';
import { useProgress } from '../../progress/hooks/useProgress';

export function useVisualization(algorithmId: string) {
  const store = useVisualizationStore();
  const currentStep = useCurrentStep();
  const { markViewed, markCompleted } = useProgress();

  useEffect(() => {
    if (algorithmId && algorithmId !== store.algorithmId) {
      store.loadAlgorithm(algorithmId);
      void markViewed(algorithmId);
    }
  }, [algorithmId]);

  useEffect(() => {
    if (
      algorithmId &&
      store.status === 'completed' &&
      store.steps.length > 0 &&
      store.currentStepIndex >= store.steps.length - 1
    ) {
      void markCompleted(algorithmId);
    }
  }, [store.status, store.currentStepIndex, algorithmId]);

  usePlaybackTimer();

  const algorithm = getAlgorithmById(algorithmId);

  return {
    algorithm,
    currentStep,
    currentStepIndex: store.currentStepIndex,
    totalSteps: store.steps.length,
    isPlaying: store.isPlaying,
    speed: store.speed,
    status: store.status,
    inputArray: store.inputArray,
    customInput: store.customInput,
    searchTargetInput: store.searchTargetInput,
    kmpText: store.kmpText,
    kmpPattern: store.kmpPattern,
    trieWordsInput: store.trieWordsInput,
    bstTargetInput: store.bstTargetInput,
    progress: store.steps.length > 1 ? store.currentStepIndex / (store.steps.length - 1) : 0,
    play: store.play,
    pause: store.pause,
    stepForward: store.stepForward,
    stepBack: store.stepBack,
    reset: store.reset,
    setSpeed: store.setSpeed,
    randomize: store.randomize,
    setCustomInput: store.setCustomInput,
    setSearchTargetInput: store.setSearchTargetInput,
    setKmpText: store.setKmpText,
    setKmpPattern: store.setKmpPattern,
    setTrieWordsInput: store.setTrieWordsInput,
    setBstTargetInput: store.setBstTargetInput,
    applyCustomInput: store.applyCustomInput,
    applyAllInputs: store.applyAllInputs,
    goToStep: store.goToStep,
  };
}
