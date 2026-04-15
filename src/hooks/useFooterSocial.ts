import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { footerSocialApi } from '@/lib/api';
import type { FooterSocial } from '@/types';

export function useFooterSocial(all = false) {
  return useQuery({
    queryKey: ['footer-social', all],
    queryFn: () => (all ? footerSocialApi.getAll() : footerSocialApi.getActive()),
    select: (res) => res.data.data,
  });
}

export function useCreateFooterSocial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => footerSocialApi.create(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['footer-social'] });
    },
  });
}

export function useUpdateFooterSocial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      footerSocialApi.update(id, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['footer-social'] });
    },
  });
}

export function useDeleteFooterSocial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => footerSocialApi.delete(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['footer-social'] });
    },
  });
}
