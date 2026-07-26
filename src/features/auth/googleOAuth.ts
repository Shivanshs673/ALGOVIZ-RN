import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';

/** e.g. 128575…-abc.apps.googleusercontent.com → com.googleusercontent.apps.128575…-abc */
export function googleReverseClientScheme(clientId: string): string | null {
  const match = clientId.match(/^([\d\w-]+)\.apps\.googleusercontent\.com$/);
  return match ? `com.googleusercontent.apps.${match[1]}` : null;
}

export function getGoogleRedirectUri(
  androidClientId: string,
  iosClientId: string,
): string {
  const nativeClientId =
    Platform.OS === 'android'
      ? androidClientId
      : Platform.OS === 'ios'
        ? iosClientId
        : '';

  const reverseScheme = nativeClientId
    ? googleReverseClientScheme(nativeClientId)
    : null;

  if (reverseScheme) {
    return makeRedirectUri({ native: `${reverseScheme}:/oauthredirect` });
  }

  return makeRedirectUri({ scheme: 'algovizplus', path: 'oauthredirect' });
}
