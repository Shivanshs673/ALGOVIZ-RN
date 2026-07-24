import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../src/features/auth/store/authStore';

export default function AuthLayout() {
  const { session, initialized } = useAuthStore();

  if (!initialized) return null;
  if (session) return <Redirect href="/(tabs)/home" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
