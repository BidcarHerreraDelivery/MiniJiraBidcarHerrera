import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '../api/ticketsApi';
import type { Ticket } from '../../../types';

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Ticket>) => ticketsApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  });
}

export function useUpdateTicket(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Ticket> & { updatedAt: string; force?: boolean }) =>
      ticketsApi.update(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      qc.invalidateQueries({ queryKey: ['ticket', id] });
    },
  });
}

export function useArchiveTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ticketsApi.archive(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  });
}
