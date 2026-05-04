import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState } from '../../../types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user: User) => set({ user, isAuthenticated: true }),
      clearSession: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'auth-store' }
  )
);
