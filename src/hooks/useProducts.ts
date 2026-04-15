import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import type { Product } from '@/types';

export function useProducts(params?: { page?: number; limit?: number; search?: string; category?: string; status?: string; sort?: string }) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getAll(params).then(res => res.data),
    staleTime: 1000 * 60,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id).then(res => res.data),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => productsApi.create(data).then(res => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      productsApi.update(id, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id).then(res => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}
