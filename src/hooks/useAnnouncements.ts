import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementsApi } from '@/lib/api';
import type { CreateAnnouncementData, UpdateAnnouncementData } from '@/types/announcement';

export function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: () => announcementsApi.getAll().then(res => res.data),
    staleTime: 1000 * 60,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAnnouncementData) => announcementsApi.create(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAnnouncementData }) =>
      announcementsApi.update(id, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsApi.delete(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useToggleAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsApi.toggle(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}
