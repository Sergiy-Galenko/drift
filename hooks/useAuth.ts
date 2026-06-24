import { useCallback, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';

import { auth, isFirebaseConfigured } from '@/lib/firebase/config';
import { createUserProfile, getUserByUsername, subscribeUserProfile, updateUserProfile } from '@/lib/firebase/users';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import type { UserProfile } from '@/types/user';
import { firebaseErrorMessage } from '@/utils/formatters';
import { logger } from '@/utils/logger';
import { CreatePasswordSchema, EmailSchema, SignInPasswordSchema, UsernameSchema } from '@/utils/validation';
import { calcReputationTier } from '@/utils/reputation';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isAuthProviderDisabled(error: unknown): boolean {
  return String(error).includes('auth/operation-not-allowed');
}

function isUnavailableError(error: unknown): boolean {
  const message = String(error).toLowerCase();
  return message.includes('unavailable') || message.includes('offline');
}

function buildFallbackProfile(user: FirebaseUser): UserProfile {
  const now = new Date();
  const rawUsername = user.displayName?.trim() || user.email?.split('@')[0] || `user_${user.uid.slice(0, 6)}`;
  const sanitized = rawUsername.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
  const username = sanitized.slice(0, 20) || `user_${user.uid.slice(0, 6)}`;
  const reputationScore = 50;

  return {
    uid: user.uid,
    username,
    displayName: user.displayName ?? username,
    avatarUrl: user.photoURL,
    bio: null,
    reputationScore,
    reputationTier: calcReputationTier(reputationScore),
    streakCurrent: 0,
    streakBest: 0,
    streakLastDate: null,
    driftsCreated: 0,
    driftsVotedOn: 0,
    driftsExecuted: 0,
    driftsFailed: 0,
    totalVotesReceived: 0,
    followersCount: 0,
    followingCount: 0,
    joinedAt: now,
    lastActiveAt: now,
    isAnonymous: false,
    isVerified: false,
    settings: {
      notificationsEnabled: true,
      anonymousDefault: false,
      vibrationEnabled: true,
    },
  };
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
            state.setProfile(buildFallbackProfile(user));
            state.setLoading(false);
            state.setInitialized(true);
          }
        }, 8000);
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
          if (isUnavailableError(message)) {
            setProfile(buildFallbackProfile(user));
          } else {
            logger.error('Profile subscription failed', { message });
            setProfile(null);
          }
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

      const parsedEmail = EmailSchema.safeParse(email);
      if (!parsedEmail.success) {
        pushToast({ title: 'Invalid email', message: parsedEmail.error.issues[0]?.message, tone: 'warning' });
        return false;
      }

      const parsedPassword = SignInPasswordSchema.safeParse(password);
      if (!parsedPassword.success) {
        pushToast({ title: 'Missing password', message: parsedPassword.error.issues[0]?.message, tone: 'warning' });
        return false;
      }

      try {
        await signInWithEmailAndPassword(auth, normalizeEmail(parsedEmail.data), password);
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

      const parsedEmail = EmailSchema.safeParse(email);
      if (!parsedEmail.success) {
        pushToast({ title: 'Invalid email', message: parsedEmail.error.issues[0]?.message, tone: 'warning' });
        return false;
      }

      const parsedPassword = CreatePasswordSchema.safeParse(password);
      if (!parsedPassword.success) {
        pushToast({ title: 'Invalid password', message: parsedPassword.error.issues[0]?.message, tone: 'warning' });
        return false;
      }

      const existingUser = await getUserByUsername(parsedUsername.data);
      if (existingUser) {
        pushToast({ title: 'Username unavailable', message: 'Choose another public handle.', tone: 'warning' });
        return false;
      }

      try {
        const credential = await createUserWithEmailAndPassword(auth, normalizeEmail(parsedEmail.data), parsedPassword.data);
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
        const existingUser = await getUserByUsername(parsed.data);
        if (existingUser && existingUser.uid !== firebaseUser.uid) {
          pushToast({ title: 'Username unavailable', message: 'Choose another public handle.', tone: 'warning' });
          return false;
        }

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
