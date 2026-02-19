import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/api/categories.api';
import type { CreateCategoryDto } from '@/api/types';

const queryKey = ['categories'] as const;

export type UseCategoriesOptions = {
  enabled?: boolean;
  /** When set, also fetches this category and provides .category and .update bound to this id */
  categoryId?: string;
};

export function useCategories(options?: UseCategoriesOptions) {
  const enabled = options?.enabled ?? true;
  const categoryId = options?.categoryId;
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey,
    queryFn: getCategories,
    retry: false,
    enabled,
  });

  const categoryQuery = useQuery({
    queryKey: [...queryKey, categoryId],
    queryFn: () => getCategory(categoryId!),
    retry: false,
    enabled: enabled && !!categoryId,
  });

  const createMutation = useMutation({
    mutationFn: (body: CreateCategoryDto) => createCategory(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (body: { name?: string; description?: string }) =>
      updateCategory(categoryId!, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      if (categoryId) {
        void queryClient.invalidateQueries({
          queryKey: [...queryKey, categoryId],
        });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    // List
    ...listQuery,
    categories: listQuery.data,
    // Single category (when categoryId is set)
    category: categoryQuery.data ?? null,
    categoryLoading: categoryQuery.isLoading,
    categoryError: categoryQuery.isError,
    categoryRefetch: categoryQuery.refetch,
    // Mutations
    create: createMutation,
    update: categoryId ? updateMutation : null,
    delete: deleteMutation,
  };
}
