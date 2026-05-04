import api from '../../../lib/axios';
import type { User } from '../../../types';

export const usersApi = {
  list: () => api.get<User[]>('/admin/users'),
  create: (data: { name: string; email: string; role: 'admin' | 'usuario' }) =>
    api.post<User>('/admin/users', data),
  deactivate: (id: string) => api.patch<User>(`/admin/users/${id}/deactivate`),
  promote: (id: string) => api.patch<User>(`/admin/users/${id}/promote`),
};
