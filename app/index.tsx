import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/features/auth/store/authStore';

export default function Index() {
  const { session, initialized } = useAuthStore();
  if (!initialized) return null;
  return <Redirect href={session ? '/(tabs)/home' : '/(auth)/login'} />;
}