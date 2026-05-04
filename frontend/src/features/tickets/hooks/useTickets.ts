import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '../api/ticketsApi';
import { useFilterStore } from '../store/filterStore';

export function useTickets() {
  const filters = useFilterStore((s) => s.filters);
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => ticketsApi.list(filters).then((r) => r.data),
  });
}
