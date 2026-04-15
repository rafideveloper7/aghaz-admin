import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';

export function useOrders(params?: { page?: number; limit?: number; status?: string; startDate?: string; endDate?: string; search?: string }) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersApi.getAll(params).then(res => res.data),
    staleTime: 1000 * 30,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id).then(res => res.data),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      ordersApi.updateStatus(id, status, notes).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordersApi.delete(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useDashboardStats(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['dashboard-stats', params],
    queryFn: () => ordersApi.getStats(params).then(res => res.data),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5,
  });
}
