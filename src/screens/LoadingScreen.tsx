import { StyleSheet, Text, View } from 'react-native';

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.pulse} />
      <Text style={styles.title}>AlgoViz+</Text>
      <Text style={styles.copy}>Restoring session and preparing the app shell.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#07111f',
    gap: 12,
  },
  pulse: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#78d7ff',
    opacity: 0.9,
  },
  title: {
    color: '#f6f9ff',
    fontSize: 24,
    fontWeight: '800',
  },
  copy: {
    color: '#9baecc',
    fontSize: 13,
  },
});
