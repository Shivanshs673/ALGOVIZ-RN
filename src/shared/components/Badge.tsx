import { StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
};

export function Badge({ label }: Props) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'rgba(120, 215, 255, 0.12)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    color: '#9fe1ff',
    fontSize: 12,
    fontWeight: '700',
  },
});