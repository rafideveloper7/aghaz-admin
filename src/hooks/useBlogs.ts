import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Blog, CreateBlogData } from '@/types';

export const useBlogs = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
  sort?: string;
  featured?: boolean;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['blogs', params],
    queryFn: () => blogsApi.getAll(params),
  });
};

export const useBlog = (slug: string) => {
  return useQuery({
    queryKey: ['blog', slug],
    queryFn: () => blogsApi.getBySlug(slug),
    enabled: !!slug,
  });
};

export const useBlogById = (id: string) => {
  return useQuery({
    queryKey: ['blogId', id],
    queryFn: () => blogsApi.getById(id),
    enabled: !!id,
  });
};

export const useFeaturedBlogs = (limit?: number) => {
  return useQuery({
    queryKey: ['featuredBlogs', limit],
    queryFn: () => blogsApi.getFeatured(limit),
  });
};

export const useRecentBlogs = (limit?: number) => {
  return useQuery({
    queryKey: ['recentBlogs', limit],
    queryFn: () => blogsApi.getRecent(limit),
  });
};

export const useCreateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData | CreateBlogData) => blogsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Blog created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create blog');
    },
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      blogsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Blog updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update blog');
    },
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Blog deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete blog');
    },
  });
};

export const useIncrementLike = () => {
  return useMutation({
    mutationFn: (id: string) => blogsApi.incrementLike(id),
  });
};
