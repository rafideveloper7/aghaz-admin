import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contactMessagesApi } from '@/lib/api';

export function useContactMessages(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['contact-messages', params],
    queryFn: () => contactMessagesApi.getAll(params).then(res => res.data),
    staleTime: 1000 * 30,
  });
}

export function useDeleteContactMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contactMessagesApi.delete(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
    },
  });
}
