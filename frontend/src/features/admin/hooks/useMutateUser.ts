import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/usersApi';

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.deactivate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function usePromoteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.promote,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
