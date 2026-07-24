import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CONCEPTS } from '../features/learn/data/conceptsData';
import { ScreenCard } from '../components/ScreenCard';

export function LearnScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenCard title="Learn concepts" subtitle="Core theory cards for algorithm intuition.">
        <View style={styles.list}>
          {CONCEPTS.map((concept) => (
            <Pressable key={concept.id} style={styles.card} onPress={() => router.push(`/concept/${concept.id}`)}>
              <Text style={styles.icon}>{concept.icon}</Text>
              <Text style={styles.title}>{concept.title}</Text>
              <Text style={styles.subtitle}>{concept.summary}</Text>
            </Pressable>
          ))}
        </View>
      </ScreenCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#101a2f',
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    color: '#f6f9ff',
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    color: '#9baecc',
    fontSize: 13,
    lineHeight: 18,
  },
});
