import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

export function Button({ label, onPress, variant = 'primary' }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.button, variant === 'secondary' && styles.buttonSecondary]}>
      <Text style={[styles.text, variant === 'secondary' && styles.textSecondary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#78d7ff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  text: {
    color: '#081120',
    fontWeight: '800',
  },
  textSecondary: {
    color: '#edf3ff',
  },
});