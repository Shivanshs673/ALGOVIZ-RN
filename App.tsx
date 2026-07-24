import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StatusBar as RNStatusBar, StyleSheet, Text, View } from 'react-native';

import { AppNavigator } from './src/navigation/AppNavigator';
import { appRoutes, type AppRoute } from './src/navigation/routes';
import { AppStateProvider, useAppState } from './src/state/AppStateProvider';
import { LoadingScreen } from './src/screens/LoadingScreen';

const initialStack: AppRoute[] = [{ name: 'home' }];
const bottomNavRoutes: AppRoute[] = [{ name: 'home' }, { name: 'algorithms' }, { name: 'rooms' }, { name: 'profile' }];

function App() {
  return (
    <AppStateProvider>
      <AppShell />
    </AppStateProvider>
  );
}

function AppShell() {
  const { session, signOut } = useAppState();
  const [stack, setStack] = useState<AppRoute[]>(initialStack);

  const navigation = useMemo(
    () => ({
      push: (route: AppRoute) => {
        setStack((current) => [...current, route]);
      },
      replace: (route: AppRoute) => {
        setStack((current) => (current.length ? [...current.slice(0, -1), route] : [route]));
      },
      pop: () => {
        setStack((current) => (current.length > 1 ? current.slice(0, -1) : current));
      },
      resetTo: (route: AppRoute) => {
        setStack([route]);
      },
      canGoBack: stack.length > 1,
    }),
    [stack.length],
  );

  const activeRoute = stack[stack.length - 1];
  const activeMeta = appRoutes[activeRoute.name];

  if (session.status === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <RNStatusBar barStyle="light-content" />

      <View style={styles.shell}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.productLabel}>AlgoViz+</Text>
            <Text style={styles.productTitle}>{activeMeta.title}</Text>
          </View>

          {navigation.canGoBack ? (
            <Pressable style={styles.topAction} onPress={navigation.pop}>
              <Text style={styles.topActionText}>Back</Text>
            </Pressable>
          ) : session.status === 'signedIn' ? (
            <Pressable
              style={styles.topAction}
              onPress={async () => {
                await signOut();
                navigation.resetTo({ name: 'auth' });
              }}
            >
              <Text style={styles.topActionText}>Sign out</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.topAction} onPress={() => navigation.resetTo({ name: 'auth' })}>
              <Text style={styles.topActionText}>Sign in</Text>
            </Pressable>
          )}
        </View>

        <AppNavigator route={activeRoute} navigation={navigation} />

        {session.status === 'signedIn' ? (
          <View style={styles.bottomNav}>
          {bottomNavRoutes.map((route) => {
            const meta = appRoutes[route.name];
            const active = activeRoute.name === route.name;
            return (
              <Pressable
                key={route.name}
                style={[styles.navItem, active && styles.navItemActive]}
                onPress={() => navigation.resetTo(route)}
              >
                <Text style={[styles.navItemText, active && styles.navItemTextActive]}>{meta.title}</Text>
              </Pressable>
            );
          })}
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

export default App;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#07111f',
  },
  shell: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  productLabel: {
    color: '#78d7ff',
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '800',
    letterSpacing: 1,
  },
  productTitle: {
    color: '#f6f9ff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  topAction: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  topActionText: {
    color: '#edf3ff',
    fontSize: 13,
    fontWeight: '700',
  },
  bottomNav: {
    flexDirection: 'row',
    gap: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#0f1930',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  navItemActive: {
    backgroundColor: '#78d7ff',
    borderColor: '#78d7ff',
  },
  navItemText: {
    color: '#a7b9d6',
    fontSize: 12,
    fontWeight: '700',
  },
  navItemTextActive: {
    color: '#081120',
  },
});
