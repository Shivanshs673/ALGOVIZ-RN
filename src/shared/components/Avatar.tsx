import { Image, StyleSheet, Text, View, StyleProp, ViewStyle, ImageStyle } from 'react-native';

type Props = {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function Avatar({ name, avatarUrl, size = 44, style }: Props) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sizeStyle = { width: size, height: size, borderRadius: size / 2 };

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={[sizeStyle, style as StyleProp<ImageStyle>]}
      />
    );
  }

  return (
    <View style={[styles.fallback, sizeStyle, style]}>
      <Text style={styles.text}>{initials || '?'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: '#78d7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#081120',
    fontWeight: '900',
  },
});