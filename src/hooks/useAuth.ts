import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function useLogin() {
  const login = useAuthStore(state => state.login);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password).then(res => res.data),
    onSuccess: (data) => {
      if (data?.success && data?.token) {
        login(data.token, data.user);
      }
    },
  });
}
