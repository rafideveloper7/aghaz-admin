import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { imagesApi } from '@/lib/api';

export const useImages = (params?: { folder?: string; page?: number; limit?: number }) => {
  const queryKey = ['admin-images', params];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await imagesApi.getAll(params);
      return response.data.data;
    },
  });
};

export const useDeleteImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => imagesApi.delete(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-images'] });
    },
  });
};

export const useBulkDeleteImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileIds: string[]) => imagesApi.bulkDelete(fileIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-images'] });
    },
  });
};
