import { create } from 'zustand';
import { AuthApi } from '../features/auth/api';
export const useAuthStore = create((set) => ({
    user: null,
    loading: false,
    async login(email, password) {
        set({ loading: true });
        try {
            const user = await AuthApi.login(email, password);
            set({ user });
        }
        finally {
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
        }
        catch {
            set({ user: null });
        }
        finally {
            set({ loading: false });
        }
    },
}));
