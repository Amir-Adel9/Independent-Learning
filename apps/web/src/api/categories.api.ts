import { apiClient } from '@/api/client';
import type { CategoryEntity, CreateCategoryDto } from '@/api/types';

export async function getCategories(): Promise<CategoryEntity[]> {
  const { data } = await apiClient.GET('/categories');
  return data ?? [];
}

export async function getCategory(
  id: string,
): Promise<CategoryEntity | null> {
  const { data } = await apiClient.GET('/categories/{id}', {
    params: { path: { id } },
  });
  return data ?? null;
}

export async function createCategory(
  body: CreateCategoryDto,
): Promise<CategoryEntity> {
  const { data } = await apiClient.POST('/categories', { body });
  if (!data) throw new Error('Failed to create category');
  return data;
}

export async function updateCategory(
  id: string,
  body: { name?: string; description?: string },
): Promise<CategoryEntity> {
  const { data } = await apiClient.PATCH('/categories/{id}', {
    params: { path: { id } },
    body,
  });
  if (!data) throw new Error('Failed to update category');
  return data;
}

export async function deleteCategory(id: string): Promise<CategoryEntity | undefined> {
  const { data } = await apiClient.DELETE('/categories/{id}', {
    params: { path: { id } },
  });
  return data;
}
