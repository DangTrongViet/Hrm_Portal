import { create } from 'zustand';
import { AuthApi, User } from '../features/auth/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  async login(email, password) {
    set({ loading: true });
    try {
      const user = await AuthApi.login(email, password);
      set({ user });
    } finally {
      set({ loading: false });
    }
  },
  async logout() {
    await AuthApi.logout();
    set({ user: null });
  },
  async fetchMe() {
    set({ loading: true });
    try {
      const user = await AuthApi.me();
      set({ user });
    } catch {
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },
}));
