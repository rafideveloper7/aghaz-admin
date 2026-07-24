import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { imagesApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export const useImages = (params?: { folder?: string; page?: number; limit?: number; usage?: string }) => {
  const token = useAuthStore(state => state.token);
  const queryKey = ['admin-images', params];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await imagesApi.getAll(params);
      return response.data.data;
    },
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useImageStats = () => {
  const token = useAuthStore(state => state.token);

  return useQuery({
    queryKey: ['admin-image-stats'],
    queryFn: async () => {
      const response = await imagesApi.getStats();
      return response.data;
    },
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useDeleteImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => imagesApi.delete(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-images'] });
      queryClient.invalidateQueries({ queryKey: ['admin-image-stats'] });
    },
  });
};

export const useBulkDeleteImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileIds: string[]) => imagesApi.bulkDelete(fileIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-images'] });
      queryClient.invalidateQueries({ queryKey: ['admin-image-stats'] });
    },
  });
};
