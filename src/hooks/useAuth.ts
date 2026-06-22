import { useCallback, useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import {
  signInAsGuest,
  signInWithGoogleIdToken,
  signOutCurrentUser,
  subscribeAuthState,
} from '@/lib/firebase/auth';
import { isMockBackend } from '@/lib/firebase/config';
import { createUserProfile, getUserProfile } from '@/lib/firebase/users';
import { useAuthStore } from '@/stores/authStore';

WebBrowser.maybeCompleteAuthSession();

const mockGoogleClientId = 'mock-client-id';

function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

export function useAuthBootstrap(): void {
  const setSession = useAuthStore((state) => state.setSession);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const setError = useAuthStore((state) => state.setError);

  useEffect(() => {
    const unsubscribe = subscribeAuthState((firebaseUser) => {
      void (async () => {
        try {
          if (!firebaseUser) {
            setSession(null, null, false);
            setInitialized(true);
            return;
          }

          const profile = await getUserProfile(firebaseUser.uid);
          setSession(firebaseUser, profile, profile === null);
          setInitialized(true);
        } catch (error) {
          setError(messageFromError(error));
          setInitialized(true);
        }
      })();
    });

    return unsubscribe;
  }, [setError, setInitialized, setSession]);
}

export function useAuth() {
  const store = useAuthStore();
  const [googlePending, setGooglePending] = useState(false);

  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? (isMockBackend ? mockGoogleClientId : undefined),
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? (isMockBackend ? mockGoogleClientId : undefined),
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? (isMockBackend ? mockGoogleClientId : undefined),
  });

  const signInGuest = useCallback(async () => {
    store.setLoading(true);
    store.setError(null);

    try {
      await signInAsGuest();
    } catch (error) {
      store.setError(messageFromError(error));
    }
  }, [store]);

  const signInGoogle = useCallback(async () => {
    store.setError(null);
    setGooglePending(true);

    try {
      if (isMockBackend) {
        await signInWithGoogleIdToken('mock-google-token');
        return;
      }

      const result = await promptAsync();

      if (result.type !== 'success') {
        return;
      }

      const idToken = result.params.id_token;

      if (!idToken) {
        throw new Error('Google did not return an ID token.');
      }

      await signInWithGoogleIdToken(idToken);
    } catch (error) {
      store.setError(messageFromError(error));
    } finally {
      setGooglePending(false);
    }
  }, [promptAsync, store]);

  const completeUsername = useCallback(
    async (username: string) => {
      if (!store.firebaseUser) {
        throw new Error('Sign in before choosing a username.');
      }

      store.setLoading(true);
      store.setError(null);

      try {
        const profile = await createUserProfile(store.firebaseUser, username);
        store.setProfile(profile);
      } catch (error) {
        store.setError(messageFromError(error));
        throw error;
      } finally {
        store.setLoading(false);
      }
    },
    [store],
  );

  const signOut = useCallback(async () => {
    await signOutCurrentUser();
    store.reset();
  }, [store]);

  return {
    ...store,
    googleReady: isMockBackend || Boolean(request),
    googlePending,
    signInGuest,
    signInGoogle,
    completeUsername,
    signOut,
  };
}
