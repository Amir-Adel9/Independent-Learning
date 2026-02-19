import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdmins,
  getAdminById,
  getAdminByEmail,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  type UpdateAdminBody,
} from '@/api/admins.api';
import type { CreateAdminDto } from '@/api/types';

const queryKey = ['admins'] as const;

export type UseAdminsOptions = {
  enabled?: boolean;
  /** When set, also fetches this admin and provides .admin and .update bound to this id */
  adminId?: string;
  /** When set, also fetches admin by this email and provides .adminByEmail */
  adminEmail?: string;
};

export function useAdmins(options?: UseAdminsOptions) {
  const enabled = options?.enabled ?? true;
  const adminId = options?.adminId;
  const adminEmail = options?.adminEmail;
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey,
    queryFn: getAdmins,
    retry: false,
    enabled,
  });

  const adminQuery = useQuery({
    queryKey: [...queryKey, 'id', adminId],
    queryFn: () => getAdminById(adminId!),
    retry: false,
    enabled: enabled && !!adminId,
  });

  const adminByEmailQuery = useQuery({
    queryKey: [...queryKey, 'email', adminEmail],
    queryFn: () => getAdminByEmail(adminEmail!),
    retry: false,
    enabled: enabled && !!adminEmail,
  });

  const createMutation = useMutation({
    mutationFn: (body: CreateAdminDto) => createAdmin(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (body: UpdateAdminBody) => updateAdmin(adminId!, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      if (adminId) {
        void queryClient.invalidateQueries({
          queryKey: [...queryKey, 'id', adminId],
        });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    // List
    ...listQuery,
    admins: listQuery.data,
    // Single admin by id (when adminId is set)
    admin: adminQuery.data ?? null,
    adminLoading: adminQuery.isLoading,
    adminError: adminQuery.isError,
    adminRefetch: adminQuery.refetch,
    // Single admin by email (when adminEmail is set)
    adminByEmail: adminByEmailQuery.data ?? null,
    adminByEmailLoading: adminByEmailQuery.isLoading,
    adminByEmailError: adminByEmailQuery.isError,
    // Mutations
    create: createMutation,
    update: adminId ? updateMutation : null,
    delete: deleteMutation,
  };
}
