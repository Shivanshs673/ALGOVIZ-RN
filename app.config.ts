import type { ExpoConfig, ConfigContext } from 'expo/config';

function googleReverseScheme(clientId: string | undefined): string | null {
  if (!clientId) return null;
  const match = clientId.match(/^([\d\w-]+)\.apps\.googleusercontent\.com$/);
  return match ? `com.googleusercontent.apps.${match[1]}` : null;
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const androidGoogleScheme = googleReverseScheme(
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  );
  const iosGoogleScheme = googleReverseScheme(
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  );

  const iosUrlSchemes = ['algovizplus', ...(iosGoogleScheme ? [iosGoogleScheme] : [])];

  return {
    ...config,
    ios: {
      ...config.ios,
      infoPlist: {
        ...config.ios?.infoPlist,
        CFBundleURLTypes: iosUrlSchemes.map((scheme) => ({
          CFBundleURLSchemes: [scheme],
        })),
      },
    },
    android: {
      ...config.android,
      ...(androidGoogleScheme
        ? {
            intentFilters: [
              {
                action: 'VIEW',
                data: [
                  {
                    scheme: androidGoogleScheme,
                    pathPrefix: '/oauthredirect',
                  },
                ],
                category: ['BROWSABLE', 'DEFAULT'],
              },
            ],
          }
        : {}),
    },
  } as ExpoConfig;
};
