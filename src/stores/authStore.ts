import { create } from 'zustand';

import type { AuthUser } from '@/types/auth';
import type { AppUser } from '@/types/user';

type AuthState = {
  firebaseUser: AuthUser | null;
  profile: AppUser | null;
  initialized: boolean;
  loading: boolean;
  needsUsername: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setSession: (firebaseUser: AuthUser | null, profile: AppUser | null, needsUsername: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setProfile: (profile: AppUser) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  profile: null,
  initialized: false,
  loading: true,
  needsUsername: false,
  error: null,
  setLoading: (loading) => set({ loading }),
  setSession: (firebaseUser, profile, needsUsername) => set({ firebaseUser, profile, needsUsername, loading: false }),
  setInitialized: (initialized) => set({ initialized }),
  setProfile: (profile) => set({ profile, needsUsername: false }),
  setError: (error) => set({ error, loading: false }),
  reset: () => set({ firebaseUser: null, profile: null, needsUsername: false, error: null, loading: false }),
}));
