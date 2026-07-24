import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
}>;

export function ScreenCard({ title, subtitle, children }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f1930',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(136, 181, 255, 0.12)',
    gap: 12,
  },
  header: {
    gap: 4,
  },
  title: {
    color: '#f6f9ff',
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: '#8fa1bf',
    fontSize: 13,
    lineHeight: 18,
  },
});