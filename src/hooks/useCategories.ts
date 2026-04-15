import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api';

export function useCategories(all = false) {
  return useQuery({
    queryKey: ['categories', all],
    queryFn: () => categoriesApi.getAll(all).then(res => res.data),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => categoriesApi.create(data).then(res => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      categoriesApi.update(id, data).then(res => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id).then(res => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}
