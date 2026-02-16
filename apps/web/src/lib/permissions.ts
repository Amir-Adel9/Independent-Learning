import type { UserEntity } from '@/api/types';

export function canCreateAdmin(user: UserEntity | null): boolean {
  return user?.role === 'super_admin';
}
