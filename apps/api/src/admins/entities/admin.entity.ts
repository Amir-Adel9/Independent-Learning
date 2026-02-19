import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { AdminRole } from '@prisma/client';

export class AdminEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'admin@example.com' })
  email: string;

  @ApiProperty({ type: String, example: 'Admin Name', nullable: true })
  name: string | null;

  @ApiProperty({ enum: ['super_admin', 'admin', 'editor'] })
  role: AdminRole;

  @ApiProperty()
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
