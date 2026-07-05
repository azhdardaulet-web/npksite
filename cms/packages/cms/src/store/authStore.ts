import { create } from 'zustand';

export type Role =
  | 'ADMIN'
  | 'CHIEF_EDITOR'
  | 'SECTION_EDITOR'
  | 'FACTION'
  | 'BRANCH_EDITOR'
  | 'RECEPTION_MANAGER';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,

  setAuth: (user, accessToken) => set({ user, accessToken }),

  setAccessToken: (accessToken) => set({ accessToken }),

  logout: () => set({ user: null, accessToken: null }),
}));

// Expose store instance so api.ts can access token without circular import
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).__AUTH_STORE__ = useAuthStore;
