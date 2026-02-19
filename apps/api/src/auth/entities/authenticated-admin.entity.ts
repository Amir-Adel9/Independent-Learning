import { ApiProperty } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';

/**
 * Shape returned by login, refresh, and me endpoints.
 * Only public fields; no id, password, refreshToken, timestamps, or isActive.
 */
export class AuthenticatedAdminEntity {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ type: String, example: 'John Doe', nullable: true })
  name: string | null;

  @ApiProperty({ enum: ['super_admin', 'admin', 'editor'] })
  role: AdminRole;

  constructor(partial: Partial<AuthenticatedAdminEntity>) {
    Object.assign(this, partial);
  }
}
