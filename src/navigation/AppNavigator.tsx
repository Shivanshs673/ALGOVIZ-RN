import type { AppNavigation, AppRoute } from './routes';
import { AuthScreen } from '../screens/AuthScreen';
import { AlgorithmsScreen } from '../screens/AlgorithmsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoadingScreen } from '../screens/LoadingScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RoomsScreen } from '../screens/RoomsScreen';
import { UpdatesScreen } from '../screens/UpdatesScreen';
import { VisualizationScreen } from '../screens/VisualizationScreen';
import { useAppState } from '../state/AppStateProvider';

type Props = {
  route: AppRoute;
  navigation: AppNavigation;
};

export function AppNavigator({ route, navigation }: Props) {
  const { session } = useAppState();

  if (session.status === 'loading') {
    return <LoadingScreen />;
  }

  if (session.status === 'signedOut' && route.name !== 'auth') {
    return <AuthScreen />;
  }

  if (session.status === 'signedIn' && route.name === 'auth') {
    return <HomeScreen />;
  }

  switch (route.name) {
    case 'auth':
      return <AuthScreen />;
    case 'algorithms':
      return <AlgorithmsScreen />;
    case 'visualization':
      return <VisualizationScreen algorithmId={route.params.algorithmId} />;
    case 'rooms':
      return <RoomsScreen />;
    case 'profile':
      return <ProfileScreen />;
    case 'updates':
      return <UpdatesScreen />;
    case 'home':
    default:
      return <HomeScreen />;
  }
}