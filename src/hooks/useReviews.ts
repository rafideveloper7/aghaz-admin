import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api';

export const useReviews = (params?: { page?: number; limit?: number; product?: string; approved?: boolean }) => {
  const queryKey = ['admin-reviews', params];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await reviewsApi.getAll(params);
      return response.data.data;
    },
  });
};

export const useReviewStats = () => {
  return useQuery({
    queryKey: ['admin-review-stats'],
    queryFn: async () => {
      const response = await reviewsApi.getStats();
      return response.data.data;
    },
  });
};

export const useApproveReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      reviewsApi.approve(id, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-review-stats'] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-review-stats'] });
    },
  });
};
