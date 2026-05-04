import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '../api/commentsApi';

export function useCreateComment(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => commentsApi.create(ticketId, content).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', ticketId] }),
  });
}

export function useUpdateComment(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      commentsApi.update(ticketId, commentId, content).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', ticketId] }),
  });
}

export function useDeleteComment(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentsApi.delete(ticketId, commentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', ticketId] }),
  });
}
