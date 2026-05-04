import api from '../../../lib/axios';
import type { Ticket, TicketFilters, PaginatedResponse } from '../../../types';

export const ticketsApi = {
  list: (filters?: TicketFilters) =>
    api.get<PaginatedResponse<Ticket>>('/tickets', { params: filters }),
  get: (id: string) => api.get<Ticket>(`/tickets/${id}`),
  create: (data: Partial<Ticket>) => api.post<Ticket>('/tickets', data),
  update: (id: string, data: Partial<Ticket> & { updatedAt: string; force?: boolean }) =>
    api.patch<Ticket>(`/tickets/${id}`, data),
  archive: (id: string) => api.patch<Ticket>(`/tickets/${id}/archive`),
  exportCsv: (filters?: TicketFilters) =>
    api.get('/tickets/export/csv', { params: filters, responseType: 'blob' }),
  exportPdf: (filters?: TicketFilters) =>
    api.get('/tickets/export/pdf', { params: filters, responseType: 'blob' }),
};
