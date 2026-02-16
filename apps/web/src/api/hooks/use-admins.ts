import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { CreateAdminDto } from '@/api/types';

const queryKey = ['admins'] as const;

async function fetchAdmins() {
  const { data } = await apiClient.GET('/api/admins');
  return data ?? [];
}

export function useAdmins(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey,
    queryFn: fetchAdmins,
    retry: false,
    enabled: options?.enabled ?? true,
  });
}

export function useAdminById(id: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...queryKey, 'id', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await apiClient.GET('/api/admins/{id}', { params: { path: { id } } });
      return data ?? null;
    },
    retry: false,
    enabled: (options?.enabled ?? true) && !!id,
  });
}

export function useAdminByEmail(email: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...queryKey, 'email', email],
    queryFn: async () => {
      if (!email) return null;
      const { data } = await apiClient.GET('/api/admins/by-email/{email}', {
        params: { path: { email } },
      });
      return data ?? null;
    },
    retry: false,
    enabled: (options?.enabled ?? true) && !!email,
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateAdminDto) => {
      const { data } = await apiClient.POST('/api/admins', { body });
      if (!data) throw new Error('Failed to create admin');
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useUpdateAdmin(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      email?: string;
      name?: string;
      password?: string;
      role?: 'super_admin' | 'admin' | 'editor';
      isActive?: boolean;
    }) => {
      const { data } = await apiClient.PATCH('/api/admins/{id}', {
        params: { path: { id } },
        body,
      });
      if (!data) throw new Error('Failed to update admin');
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({ queryKey: [...queryKey, 'id', id] });
    },
  });
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.DELETE('/api/admins/{id}', {
        params: { path: { id } },
      });
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}
