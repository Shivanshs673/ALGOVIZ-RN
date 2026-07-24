import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ScreenCard } from '../components/ScreenCard';
import { useAppState } from '../state/AppStateProvider';
export function AuthScreen() {
  const router = useRouter();
  const { signIn } = useAppState();
  const [pendingProvider, setPendingProvider] = useState<'email' | 'google' | null>(null);

  const handleSignIn = async (provider: 'email' | 'google') => {
    setPendingProvider(provider);
    await signIn(provider);
    router.replace('/(tabs)/home');
    setPendingProvider(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenCard title="Sign in" subtitle="Email and Google entry points for the first build slice.">
        <View style={styles.buttonStack}>
          <ActionButton
            label={pendingProvider === 'email' ? 'Signing in...' : 'Continue with email'}
            onPress={() => handleSignIn('email')}
            disabled={pendingProvider !== null}
          />
          <ActionButton
            label={pendingProvider === 'google' ? 'Signing in...' : 'Continue with Google'}
            secondary
            onPress={() => handleSignIn('google')}
            disabled={pendingProvider !== null}
          />
          <ActionButton
            label="Go to profile onboarding"
            secondary
            onPress={() => router.push('/(tabs)/profile')}
          />
        </View>
      </ScreenCard>
    </ScrollView>
  );
}

function ActionButton({
  label,
  secondary,
  onPress,
  disabled,
}: {
  label: string;
  secondary?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        secondary ? styles.buttonSecondary : styles.buttonPrimary,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  buttonStack: {
    gap: 12,
  },
  button: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#78d7ff',
  },
  buttonSecondary: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  buttonDisabled: {
    opacity: 0.62,
  },
  buttonText: {
    color: '#081120',
    fontWeight: '800',
  },
  buttonTextSecondary: {
    color: '#edf3ff',
  },
});