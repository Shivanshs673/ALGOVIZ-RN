export type AppRouteName = 'home' | 'auth' | 'algorithms' | 'visualization' | 'rooms' | 'profile' | 'updates';

export type AppRoute =
  | { name: 'home' }
  | { name: 'auth' }
  | { name: 'algorithms' }
  | { name: 'visualization'; params: { algorithmId: string } }
  | { name: 'rooms' }
  | { name: 'profile' }
  | { name: 'updates' };

export type AppNavigation = {
  push: (route: AppRoute) => void;
  replace: (route: AppRoute) => void;
  resetTo: (route: AppRoute) => void;
  pop: () => void;
  canGoBack: boolean;
};

export const appRoutes: Record<AppRouteName, { title: string; subtitle: string }> = {
  home: { title: 'Home', subtitle: 'App overview and quick launch' },
  auth: { title: 'Sign in', subtitle: 'Email and Google entry points' },
  algorithms: { title: 'Algorithms', subtitle: 'Offline catalog and visualization' },
  visualization: { title: 'Visualization', subtitle: 'Step playback for a selected algorithm' },
  rooms: { title: 'Study rooms', subtitle: 'Realtime collaboration space' },
  profile: { title: 'Profile', subtitle: 'Identity and onboarding' },
  updates: { title: 'Updates', subtitle: 'GitHub release and fallback flow' },
};