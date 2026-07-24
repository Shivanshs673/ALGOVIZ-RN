import { useLocalSearchParams } from 'expo-router';

import { VisualizationScreen } from '../../src/screens/VisualizationScreen';

export default function AlgorithmDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <VisualizationScreen algorithmId={id ?? 'bubble-sort'} />;
}
