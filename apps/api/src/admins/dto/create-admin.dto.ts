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
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsStrongPassword({
    minLength: 6,
    minLowercase: 0,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0,
  })
  password: string;

  @IsIn(CREATABLE_ADMIN_ROLES, {
    message: 'role must be one of: admin, editor',
  })
  role: AdminRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
