import type { components, paths } from './schema';

export type { components, paths };

/** Auth user shape (auth/me, login, register, refresh responses) */
export type UserEntity = components['schemas']['AuthenticatedAdminEntity'];

export type CategoryEntity = components['schemas']['CategoryEntity'];
export type CreateCategoryDto = components['schemas']['CreateCategoryDto'];
export type UpdateCategoryDto = components['schemas']['UpdateCategoryDto'];
export type AdminEntity = components['schemas']['AdminEntity'];
export type CreateAdminDto = components['schemas']['CreateAdminDto'];
export type UpdateAdminDto = components['schemas']['UpdateAdminDto'];

export type LoginDto = components['schemas']['LoginDto'];
export type RegisterDto = components['schemas']['RegisterDto'];

/** GET /auth/me response */
export type AuthMeResponse =
  paths['/auth/me']['get']['responses']['200']['content']['application/json'];

/** POST /auth/login response */
export type LoginResponse =
  paths['/auth/login']['post']['responses']['200']['content']['application/json'];

/** POST /auth/register response */
export type RegisterResponse =
  paths['/auth/register']['post']['responses']['201']['content']['application/json'];

/** POST /auth/refresh response */
export type RefreshResponse =
  paths['/auth/refresh']['post']['responses']['200']['content']['application/json'];

/** Backend error shape from GlobalExceptionFilter */
export interface ApiErrorBody {
  success: false;
  statusCode: number;
  message: string;
}
