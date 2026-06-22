import {
  GoogleAuthProvider,
  type Auth,
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCredential,
  signOut,
} from 'firebase/auth';

import { assertFirebaseConfigured, firebaseApp, isMockBackend } from '@/lib/firebase/config';
import {
  mockSignInAsGuest,
  mockSignInWithGoogle,
  mockSignOut,
  subscribeMockAuthState,
} from '@/lib/mock/backend';
import type { AuthUser } from '@/types/auth';

export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;

function requireAuth(): Auth {
  assertFirebaseConfigured();

  if (!auth) {
    throw new Error('Firebase Auth is not available in mock mode.');
  }

  return auth;
}

export function subscribeAuthState(callback: (user: AuthUser | null) => void): () => void {
  if (isMockBackend) {
    return subscribeMockAuthState(callback);
  }

  return onAuthStateChanged(requireAuth(), callback);
}

export async function signInAsGuest(): Promise<AuthUser> {
  if (isMockBackend) {
    return mockSignInAsGuest();
  }

  const credential = await signInAnonymously(requireAuth());
  return credential.user;
}

export async function signInWithGoogleIdToken(idToken: string): Promise<AuthUser> {
  if (isMockBackend) {
    return mockSignInWithGoogle();
  }

  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(requireAuth(), credential);
  return userCredential.user;
}

export async function signOutCurrentUser(): Promise<void> {
  if (isMockBackend) {
    await mockSignOut();
    return;
  }

  await signOut(requireAuth());
}
