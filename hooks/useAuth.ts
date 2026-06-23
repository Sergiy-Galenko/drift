import { useCallback, useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCredential,
  signOut as firebaseSignOut,
} from 'firebase/auth';

import { auth, isFirebaseConfigured } from '@/lib/firebase/config';
import { createUserProfile, subscribeUserProfile, updateUserProfile } from '@/lib/firebase/users';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { firebaseErrorMessage } from '@/utils/formatters';
import { logger } from '@/utils/logger';
import { UsernameSchema } from '@/utils/validation';

WebBrowser.maybeCompleteAuthSession();

const devGoogleClientId = 'dev-google-client-id';

function envClientId(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

const googleClientIds = {
  iosClientId: envClientId(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID),
  iosReversedClientId: envClientId(process.env.EXPO_PUBLIC_GOOGLE_IOS_REVERSED_CLIENT_ID),
  androidClientId: envClientId(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID),
  webClientId: envClientId(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID),
};

const googleRedirectUriOptions =
  Platform.OS === 'ios' && googleClientIds.iosReversedClientId
    ? { native: `${googleClientIds.iosReversedClientId}:/oauthredirect` }
    : undefined;

const isGoogleConfiguredForPlatform =
  Platform.select({
    ios: Boolean(googleClientIds.iosClientId),
    android: Boolean(googleClientIds.androidClientId),
    default: Boolean(googleClientIds.webClientId),
  }) ?? false;

const requiredGoogleEnvName =
  Platform.select({
    ios: 'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID',
    android: 'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID',
    default: 'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
  }) ?? 'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID';

export function useAuthBootstrap(): void {
  const setFirebaseUser = useAuthStore((state) => state.setFirebaseUser);
  const setProfile = useAuthStore((state) => state.setProfile);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const reset = useAuthStore((state) => state.reset);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeProfile?.();
      unsubscribeProfile = null;

      if (!user) {
        reset();
        return;
      }

      setFirebaseUser(user);
      setLoading(true);
      unsubscribeProfile = subscribeUserProfile(
        user.uid,
        (profile) => {
          setProfile(profile);
          setLoading(false);
          setInitialized(true);
        },
        (message) => {
          logger.error('Profile subscription failed', { message });
          setProfile(null);
          setLoading(false);
          setInitialized(true);
        },
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile?.();
    };
  }, [reset, setFirebaseUser, setInitialized, setLoading, setProfile]);
}

export function useAuth() {
  const firebaseUser = useAuthStore((state) => state.firebaseUser);
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);
  const pushToast = useUIStore((state) => state.pushToast);
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: googleClientIds.iosClientId ?? devGoogleClientId,
    androidClientId: googleClientIds.androidClientId ?? devGoogleClientId,
    webClientId: googleClientIds.webClientId ?? devGoogleClientId,
  }, googleRedirectUriOptions);

  useEffect(() => {
    if (response?.type === 'error') {
      const message = response.error?.description ?? response.params.error_description ?? response.error?.message ?? 'Google rejected the auth request.';
      logger.error('Google auth request failed', {
        error: response.params.error,
        errorDescription: response.params.error_description,
        url: response.url,
      });
      pushToast({ title: 'Google sign in failed', message, tone: 'danger' });
      return;
    }

    if (response?.type !== 'success') {
      return;
    }

    const idToken = response.params.id_token;
    if (!idToken) {
      pushToast({ title: 'Google sign in failed', message: 'Missing identity token.', tone: 'danger' });
      return;
    }

    const credential = GoogleAuthProvider.credential(idToken);
    signInWithCredential(auth, credential).catch((error: unknown) => {
      logger.error('Google sign in failed', { error: String(error) });
      pushToast({ title: 'Google sign in failed', message: firebaseErrorMessage(String(error)), tone: 'danger' });
    });
  }, [pushToast, response]);

  const signInGuest = useCallback(async () => {
    if (!isFirebaseConfigured) {
      pushToast({ title: 'Firebase not configured', message: 'Fill .env with EXPO_PUBLIC_FIREBASE_* values.', tone: 'warning' });
      return;
    }

    try {
      await signInAnonymously(auth);
    } catch (error) {
      logger.error('Anonymous sign in failed', { error: String(error) });
      pushToast({ title: 'Could not continue', message: firebaseErrorMessage(String(error)), tone: 'danger' });
    }
  }, [pushToast]);

  const signInGoogle = useCallback(async () => {
    if (!isFirebaseConfigured) {
      pushToast({ title: 'Firebase not configured', message: 'Fill .env with Firebase and Google client IDs.', tone: 'warning' });
      return;
    }

    if (!isGoogleConfiguredForPlatform || !request) {
      pushToast({ title: 'Google unavailable', message: `Fill ${requiredGoogleEnvName} in .env for this platform.`, tone: 'warning' });
      return;
    }

    await promptAsync();
  }, [promptAsync, pushToast, request]);

  const completeProfile = useCallback(
    async (username: string, displayName?: string | null) => {
      if (!firebaseUser) {
        pushToast({ title: 'Not signed in', message: 'Sign in before choosing a username.', tone: 'warning' });
        return false;
      }

      const parsed = UsernameSchema.safeParse(username.trim());
      if (!parsed.success) {
        pushToast({ title: 'Invalid username', message: parsed.error.issues[0]?.message, tone: 'warning' });
        return false;
      }

      try {
        if (profile) {
          await updateUserProfile(firebaseUser.uid, { username: parsed.data, displayName: displayName ?? profile.displayName });
        } else {
          await createUserProfile(firebaseUser.uid, {
            username: parsed.data,
            displayName: displayName ?? firebaseUser.displayName,
            avatarUrl: firebaseUser.photoURL,
            bio: null,
            isAnonymous: firebaseUser.isAnonymous,
          });
        }
        return true;
      } catch (error) {
        logger.error('Profile completion failed', { error: String(error) });
        pushToast({ title: 'Profile failed', message: firebaseErrorMessage(String(error)), tone: 'danger' });
        return false;
      }
    },
    [firebaseUser, profile, pushToast],
  );

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      logger.error('Sign out failed', { error: String(error) });
      pushToast({ title: 'Could not sign out', message: firebaseErrorMessage(String(error)), tone: 'danger' });
    }
  }, [pushToast]);

  return {
    firebaseUser,
    profile,
    loading,
    signInGuest,
    signInGoogle,
    completeProfile,
    signOut,
  };
}
