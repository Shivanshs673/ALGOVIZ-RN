/** @type {import('expo/config').ExpoConfig} */
/** @param {import('expo/config').ConfigContext} param0 */
module.exports = ({ config }) => {
  const googleReverseScheme = (clientId) => {
    if (!clientId) return null;
    const match = clientId.match(/^([\d\w-]+)\.apps\.googleusercontent\.com$/);
    return match ? `com.googleusercontent.apps.${match[1]}` : null;
  };

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
        ITSAppUsesNonExemptEncryption: false,
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
  };
};
