import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/features/auth/store/authStore';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: {
  name: 'home' | 'algorithms' | 'study-rooms' | 'learn' | 'progress' | 'profile';
  title: string;
  icon: IconName;
  activeIcon: IconName;
}[] = [
  { name: 'home', title: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { name: 'algorithms', title: 'Algorithms', icon: 'code-slash-outline', activeIcon: 'code-slash' },
  { name: 'study-rooms', title: 'Rooms', icon: 'people-outline', activeIcon: 'people' },
  { name: 'learn', title: 'Learn', icon: 'book-outline', activeIcon: 'book' },
  { name: 'progress', title: 'Progress', icon: 'stats-chart-outline', activeIcon: 'stats-chart' },
  { name: 'profile', title: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

export default function TabsLayout() {
  const { session, initialized } = useAuthStore();

  if (!initialized) return null;
  if (!session) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1E1E2E',
          borderTopColor: '#2A2A4A',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#6B6B8A',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? tab.activeIcon : tab.icon} size={22} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
