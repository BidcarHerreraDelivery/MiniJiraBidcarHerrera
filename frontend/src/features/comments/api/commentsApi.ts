import api from '../../../lib/axios';
import type { Comment } from '../../../types';

export const commentsApi = {
  list: (ticketId: string) => api.get<Comment[]>(`/tickets/${ticketId}/comments`),
  create: (ticketId: string, content: string) =>
    api.post<Comment>(`/tickets/${ticketId}/comments`, { content }),
  update: (ticketId: string, commentId: string, content: string) =>
    api.patch<Comment>(`/tickets/${ticketId}/comments/${commentId}`, { content }),
  delete: (ticketId: string, commentId: string) =>
    api.delete(`/tickets/${ticketId}/comments/${commentId}`),
};
