import { useCallback, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';

import { auth, isFirebaseConfigured } from '@/lib/firebase/config';
import { createUserProfile, subscribeUserProfile, updateUserProfile } from '@/lib/firebase/users';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { firebaseErrorMessage } from '@/utils/formatters';
import { logger } from '@/utils/logger';
import { UsernameSchema } from '@/utils/validation';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isAuthProviderDisabled(error: unknown): boolean {
  return String(error).includes('auth/operation-not-allowed');
}

export function useAuthBootstrap(): void {
  const setFirebaseUser = useAuthStore((state) => state.setFirebaseUser);
  const setProfile = useAuthStore((state) => state.setProfile);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const reset = useAuthStore((state) => state.reset);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    let bootstrapTimeout: ReturnType<typeof setTimeout> | null = null;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeProfile?.();
      unsubscribeProfile = null;
      if (bootstrapTimeout) {
        clearTimeout(bootstrapTimeout);
        bootstrapTimeout = null;
      }

      if (!user) {
        reset();
        return;
      }

      setFirebaseUser(user);
      if (!useAuthStore.getState().initialized) {
        setLoading(true);
        bootstrapTimeout = setTimeout(() => {
          const state = useAuthStore.getState();
          if (!state.initialized) {
            logger.warn('Auth bootstrap timed out');
            state.setLoading(false);
            state.setInitialized(true);
          }
        }, 5000);
      }
      unsubscribeProfile = subscribeUserProfile(
        user.uid,
        (profile) => {
          if (bootstrapTimeout) {
            clearTimeout(bootstrapTimeout);
            bootstrapTimeout = null;
          }
          setProfile(profile);
          setLoading(false);
          setInitialized(true);
        },
        (message) => {
          if (bootstrapTimeout) {
            clearTimeout(bootstrapTimeout);
            bootstrapTimeout = null;
          }
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
      if (bootstrapTimeout) {
        clearTimeout(bootstrapTimeout);
      }
    };
  }, [reset, setFirebaseUser, setInitialized, setLoading, setProfile]);
}

export function useAuth() {
  const firebaseUser = useAuthStore((state) => state.firebaseUser);
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);
  const pushToast = useUIStore((state) => state.pushToast);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      if (!isFirebaseConfigured) {
        pushToast({ title: 'Firebase not configured', message: 'Fill .env with EXPO_PUBLIC_FIREBASE_* values.', tone: 'warning' });
        return false;
      }

      if (!email.trim() || !password) {
        pushToast({ title: 'Missing credentials', message: 'Enter your email and password.', tone: 'warning' });
        return false;
      }

      try {
        await signInWithEmailAndPassword(auth, normalizeEmail(email), password);
        return true;
      } catch (error) {
        if (!isAuthProviderDisabled(error)) {
          logger.error('Email sign in failed', { error: String(error) });
        }
        pushToast({ title: 'Could not sign in', message: firebaseErrorMessage(String(error)), tone: 'danger' });
        return false;
      }
    },
    [pushToast],
  );

  const registerWithPassword = useCallback(
    async (email: string, password: string, username: string) => {
      if (!isFirebaseConfigured) {
        pushToast({ title: 'Firebase not configured', message: 'Fill .env with EXPO_PUBLIC_FIREBASE_* values.', tone: 'warning' });
        return false;
      }

      const parsedUsername = UsernameSchema.safeParse(username.trim());
      if (!parsedUsername.success) {
        pushToast({ title: 'Invalid username', message: parsedUsername.error.issues[0]?.message, tone: 'warning' });
        return false;
      }

      if (!email.trim() || password.length < 6) {
        pushToast({ title: 'Invalid credentials', message: 'Use a valid email and at least 6 characters for password.', tone: 'warning' });
        return false;
      }

      try {
        const credential = await createUserWithEmailAndPassword(auth, normalizeEmail(email), password);
        await updateProfile(credential.user, { displayName: parsedUsername.data });
        await createUserProfile(credential.user.uid, {
          username: parsedUsername.data,
          displayName: parsedUsername.data,
          avatarUrl: null,
          bio: null,
          isAnonymous: false,
        });
        return true;
      } catch (error) {
        if (!isAuthProviderDisabled(error)) {
          logger.error('Email registration failed', { error: String(error) });
        }
        pushToast({ title: 'Could not create account', message: firebaseErrorMessage(String(error)), tone: 'danger' });
        return false;
      }
    },
    [pushToast],
  );

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
    signInWithPassword,
    registerWithPassword,
    completeProfile,
    signOut,
  };
}
