import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { CreateCategoryDto } from '@/api/types';

const queryKey = ['categories'] as const;

async function fetchCategories() {
  const { data } = await apiClient.GET('/api/categories');
  return data ?? [];
}

export function useCategories(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey,
    queryFn: fetchCategories,
    retry: false,
    enabled: options?.enabled ?? true,
  });
}

export function useCategory(id: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...queryKey, id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await apiClient.GET('/api/categories/{id}', { params: { path: { id } } });
      return data ?? null;
    },
    retry: false,
    enabled: (options?.enabled ?? true) && !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateCategoryDto) => {
      const { data } = await apiClient.POST('/api/categories', { body });
      if (!data) throw new Error('Failed to create category');
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name?: string; description?: string }) => {
      const { data } = await apiClient.PATCH('/api/categories/{id}', {
        params: { path: { id } },
        body,
      });
      if (!data) throw new Error('Failed to update category');
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({ queryKey: [...queryKey, id] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.DELETE('/api/categories/{id}', {
        params: { path: { id } },
      });
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}
