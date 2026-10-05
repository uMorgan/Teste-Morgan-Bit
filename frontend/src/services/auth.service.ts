import type { LoginResponse, User } from '../types/api';
import { api } from './api';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
    return data;
  },

  async me(signal?: AbortSignal): Promise<User> {
    const { data } = await api.get<User>('/auth/me', { signal });
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};
