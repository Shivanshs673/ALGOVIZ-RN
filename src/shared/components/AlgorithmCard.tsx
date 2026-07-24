import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Algorithm } from '../../types/algorithm.types';

type Props = {
  algorithm: Algorithm;
  onPress: () => void;
  compact?: boolean;
};

export function AlgorithmCard({ algorithm, onPress, compact }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{algorithm.name}</Text>
        <Text style={styles.meta}>{algorithm.difficulty}</Text>
      </View>
      {!compact ? <Text style={styles.description}>{algorithm.description}</Text> : null}
      <View style={styles.tags}>
        {algorithm.tags.slice(0, 3).map((tag) => (
          <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  name: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    flex: 1,
  },
  meta: {
    color: '#6C63FF',
    fontWeight: '700',
    fontSize: 12,
  },
  description: {
    color: '#9E9EB8',
    fontSize: 13,
    lineHeight: 18,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#2A2A4A',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    color: '#CDD0FF',
    fontSize: 11,
    fontWeight: '600',
  },
});
