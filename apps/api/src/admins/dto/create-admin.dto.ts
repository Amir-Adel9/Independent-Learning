import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsStrongPassword,
  IsOptional,
  IsIn,
  IsBoolean,
} from 'class-validator';
import { AdminRole } from '@prisma/client';

/** Only admin and editor can be assigned when creating an admin (super_admin is omitted). */
const CREATABLE_ADMIN_ROLES = [
  AdminRole.admin,
  AdminRole.editor,
] satisfies AdminRole[];

export class CreateAdminDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ minLength: 6 })
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 0,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0,
  })
  password: string;

  @ApiProperty({ enum: ['admin', 'editor'] })
  @IsIn(CREATABLE_ADMIN_ROLES, {
    message: 'role must be one of: admin, editor',
  })
  role: AdminRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
