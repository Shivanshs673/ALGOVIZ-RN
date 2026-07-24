import { useEffect, useRef } from 'react';
import { useVisualizationStore } from '../store/visualizationStore';
import { SPEED_DELAY_MS } from '../../../types/algorithm.types';

export function usePlaybackTimer() {
  const isPlaying    = useVisualizationStore(s => s.isPlaying);
  const speed        = useVisualizationStore(s => s.speed);
  const steps        = useVisualizationStore(s => s.steps);
  const currentIndex = useVisualizationStore(s => s.currentStepIndex);
  const pause        = useVisualizationStore(s => s.pause);

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
        useVisualizationStore.setState({ isPlaying: true, status: 'playing' });
      }
    }, delay);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, speed]);

  useEffect(() => {
    if (currentIndex >= steps.length - 1 && isPlaying) {
      pause();
    }
  }, [currentIndex, steps.length]);
}
