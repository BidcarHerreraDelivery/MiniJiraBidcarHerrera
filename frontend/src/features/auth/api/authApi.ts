import api from '../../../lib/axios';
import type { User } from '../../../types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User }>('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<User>('/auth/me'),
};
