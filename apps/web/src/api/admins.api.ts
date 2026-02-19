import { apiClient } from '@/api/client';
import type { AdminEntity, CreateAdminDto } from '@/api/types';

export type UpdateAdminBody = {
  email?: string;
  name?: string;
  password?: string;
  role?: 'admin' | 'editor';
  isActive?: boolean;
};

export async function getAdmins(): Promise<AdminEntity[]> {
  const { data } = await apiClient.GET('/admins');
  return data ?? [];
}

export async function getAdminById(id: string): Promise<AdminEntity | null> {
  const { data } = await apiClient.GET('/admins/{id}', {
    params: { path: { id } },
  });
  return data ?? null;
}

export async function getAdminByEmail(
  email: string,
): Promise<AdminEntity | null> {
  const { data } = await apiClient.GET('/admins/by-email/{email}', {
    params: { path: { email } },
  });
  return data ?? null;
}

export async function createAdmin(body: CreateAdminDto): Promise<AdminEntity> {
  const { data } = await apiClient.POST('/admins', { body });
  if (!data) throw new Error('Failed to create admin');
  return data;
}

export async function updateAdmin(
  id: string,
  body: UpdateAdminBody,
): Promise<AdminEntity> {
  const { data } = await apiClient.PATCH('/admins/{id}', {
    params: { path: { id } },
    body,
  });
  if (!data) throw new Error('Failed to update admin');
  return data;
}

export async function deleteAdmin(id: string): Promise<AdminEntity | undefined> {
  const { data } = await apiClient.DELETE('/admins/{id}', {
    params: { path: { id } },
  });
  return data;
}
