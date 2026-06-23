import type { User } from 'firebase/auth';
import { create } from 'zustand';

import type { UserProfile } from '@/types/user';

type AuthState = {
  firebaseUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  setFirebaseUser: (firebaseUser: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  profile: null,
  loading: true,
  initialized: false,
  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
  reset: () => set({ firebaseUser: null, profile: null, loading: false, initialized: true }),
}));
