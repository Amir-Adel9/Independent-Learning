import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { apiClient, extractErrorMessage } from '@/api/client';
import { useAuthStore } from '@/stores/auth.store';
import type { LoginDto, RegisterDto } from '@/api/types';

async function loginApi(body: LoginDto) {
  const { data } = await apiClient.POST('/auth/login', { body });
  return data!;
}

async function logoutApi(): Promise<void> {
  await apiClient.POST('/auth/logout');
}

async function registerApi(body: RegisterDto) {
  const { data } = await apiClient.POST('/auth/register', { body });
  return data!;
}

async function fetchProfile() {
  const { data } = await apiClient.GET('/auth/me');
  return data ?? null;
}

export function useAuth(profileOptions?: { enabled?: boolean }) {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);

  const login = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      setUser(data);
      toast.success('Signed in successfully');
      navigate({ to: '/' });
    },
    onError: async (err: unknown) => {
      const message = await extractErrorMessage(err, 'Login failed');
      toast.error(message);
    },
  });

  const logout = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      clearUser();
      window.location.href = '/login';
    },
    onError: () => {
      clearUser();
      window.location.href = '/login';
    },
  });

  const register = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      setUser(data);
      toast.success('Account created');
      navigate({ to: '/' });
    },
    onError: async (err: unknown) => {
      const message = await extractErrorMessage(err, 'Registration failed');
      toast.error(message);
    },
  });

  const profile = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: async () => {
      const user = await fetchProfile();
      setUser(user);
      return user;
    },
    enabled: profileOptions?.enabled ?? true,
    retry: false,
  });

  return { login, logout, register, profile };
}
