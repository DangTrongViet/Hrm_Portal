import { getJSON, postJSON, postNoBody } from '../../lib/http';

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export const AuthApi = {
  async login(email: string, password: string): Promise<User> {
    // BE sẽ set cookie HttpOnly
    return postJSON<User>('/auth/login', { email, password });
  },

  async logout(): Promise<void> {
    await postNoBody('/auth/logout');
  },

  async me(): Promise<User> {
    return getJSON<User>('/auth/me');
  },
};
