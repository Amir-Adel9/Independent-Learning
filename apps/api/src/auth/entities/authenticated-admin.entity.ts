import { AdminRole } from '@prisma/client';

/**
 * Shape returned by login, refresh, and me endpoints.
 * Only public fields; no id, password, refreshToken, timestamps, or isActive.
 */
export class AuthenticatedAdminEntity {
  email: string;
  name: string | null;
  role: AdminRole;

  constructor(partial: Partial<AuthenticatedAdminEntity>) {
    Object.assign(this, partial);
  }
}
