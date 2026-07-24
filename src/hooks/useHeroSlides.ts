import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { heroSlidesApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { HeroSlide } from '@/types';

export function useHeroSlides(all = false) {
  const token = useAuthStore(state => state.token);

  return useQuery({
    queryKey: ['hero-slides', all],
    queryFn: () => (all ? heroSlidesApi.getAll() : heroSlidesApi.getActive()),
    enabled: !!token,
    retry: false,
    select: (res) => res.data.data,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useCreateHeroSlide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => heroSlidesApi.create(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
    },
  });
}

export function useUpdateHeroSlide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      heroSlidesApi.update(id, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
    },
  });
}

export function useDeleteHeroSlide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => heroSlidesApi.delete(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
    },
  });
}

export function useReorderHeroSlides() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slides: { id: string; sortOrder: number }[]) =>
      heroSlidesApi.reorder(slides).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
    },
  });
}
