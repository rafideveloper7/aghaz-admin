import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contactMessagesApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function useContactMessages(params?: { page?: number; limit?: number; search?: string }) {
  const token = useAuthStore(state => state.token);

  return useQuery({
    queryKey: ['contact-messages', params],
    queryFn: () => contactMessagesApi.getAll(params).then(res => res.data),
    enabled: !!token,
    retry: false,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
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
