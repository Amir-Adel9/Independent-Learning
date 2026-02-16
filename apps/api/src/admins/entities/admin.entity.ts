import { Exclude } from 'class-transformer';
import { AdminRole } from '@prisma/client';

export class AdminEntity {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
  isActive: boolean;

  @Exclude()
  password: string;

  @Exclude()
  refreshToken?: string | null;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  constructor(partial: Partial<AdminEntity>) {
    Object.assign(this, partial);
  }
}
