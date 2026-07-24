import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

const AUTH_COOKIE_NAME = 'aghaz-admin-auth';

const syncAuthCookie = (token: string | null, user: User | null) => {
  if (typeof document === 'undefined') return;

  if (token && user) {
    const payload = JSON.stringify({ state: { token, user } });
    document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(payload)}; path=/; max-age=2592000; SameSite=Lax`;
  } else {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
};

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      login: (token: string, user: User) => {
        set({ token, user });
        syncAuthCookie(token, user);
      },
      logout: () => {
        set({ token: null, user: null });
        syncAuthCookie(null, null);
      },
      isAuthenticated: () => {
        const { token } = get();
        return !!token;
      },
    }),
    {
      name: 'aghaz-admin-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          syncAuthCookie(state.token, state.user);
        }
      },
    }
  )
);
