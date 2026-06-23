import {
  type Auth,
  getAuth,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';

import { assertFirebaseConfigured, firebaseApp, isMockBackend } from '@/lib/firebase/config';
import { mockSignOut, subscribeMockAuthState } from '@/lib/mock/backend';
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

export async function signOutCurrentUser(): Promise<void> {
  if (isMockBackend) {
    await mockSignOut();
    return;
  }

  await signOut(requireAuth());
}
