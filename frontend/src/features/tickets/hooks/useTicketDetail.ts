import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '../api/ticketsApi';

export function useTicketDetail(id: string) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsApi.get(id).then((r) => r.data),
    enabled: !!id,
  });
}
