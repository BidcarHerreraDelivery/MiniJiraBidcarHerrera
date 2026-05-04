import { useQuery } from '@tanstack/react-query';
import { commentsApi } from '../api/commentsApi';

export function useComments(ticketId: string) {
  return useQuery({
    queryKey: ['comments', ticketId],
    queryFn: () => commentsApi.list(ticketId).then((r) => r.data),
    enabled: !!ticketId,
  });
}
