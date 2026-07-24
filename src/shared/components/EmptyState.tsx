import { StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle: string;
  icon?: string;
};

export function EmptyState({ title, subtitle, icon = '◌' }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    gap: 8,
  },
  icon: {
    color: '#78d7ff',
    fontSize: 34,
  },
  title: {
    color: '#f6f9ff',
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    color: '#9baecc',
    fontSize: 13,
    textAlign: 'center',
  },
});