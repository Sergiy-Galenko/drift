import { useCallback, useEffect } from 'react';

import { signOutCurrentUser, subscribeAuthState } from '@/lib/firebase/auth';
import { createUserProfile, getUserProfile } from '@/lib/firebase/users';
import { useAuthStore } from '@/stores/authStore';

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
    completeUsername,
    signOut,
  };
}
