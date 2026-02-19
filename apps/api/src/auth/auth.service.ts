import * as bcrypt from 'bcrypt';
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { AdminEntity } from '../admins/entities/admin.entity';
import { AdminsService } from '../admins/admins.service';
import { AuthenticatedAdminEntity } from './entities/authenticated-admin.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

type AdminWithPassword = AdminEntity & { password: string };

const ACCESS_TOKEN_MAX_AGE_MS = 900_000; // 15 minutes
const REFRESH_TOKEN_MAX_AGE_MS = 604_800_000; // 7 days
const REFRESH_COOKIE_PATH = '/api/auth/refresh';

@Injectable()
export class AuthService {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly jwtService: JwtService,
  ) {}

  toAuthResponse(admin: AdminEntity): AuthenticatedAdminEntity {
    return new AuthenticatedAdminEntity({
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });
  }

  getAccessToken(admin: AdminEntity): string {
    const payload: JwtPayload = {
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };
    return this.jwtService.sign(payload, { expiresIn: '15m' });
  }

  getRefreshToken(admin: AdminEntity): string {
    const payload: JwtPayload = {
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  async setCookies(res: Response, admin: AdminEntity): Promise<void> {
    const accessToken = this.getAccessToken(admin);
    const refreshToken = this.getRefreshToken(admin);
    await this.adminsService.updateRefreshToken(admin.id, refreshToken);

    const cookieOptions = {
      httpOnly: true,
      sameSite: 'strict' as const,
    };

    res.cookie('access_token', accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    });
    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
      path: REFRESH_COOKIE_PATH,
    });
  }

  async register(
    dto: RegisterDto,
    res: Response,
  ): Promise<AuthenticatedAdminEntity> {
    const existing = await this.adminsService.findAdminByEmailWithPassword(
      dto.email,
    );
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }
    const admin = await this.adminsService.createAdmin({
      email: dto.email,
      name: dto.name,
      password: dto.password,
      role: 'editor',
      isActive: true,
    });
    await this.setCookies(res, admin);
    return this.toAuthResponse(admin);
  }

  async login(dto: LoginDto, res: Response): Promise<AuthenticatedAdminEntity> {
    const admin = await this.validateAdmin(dto.email, dto.password);
    if (!admin) {
      throw new UnauthorizedException('Invalid email or password');
    }
    await this.setCookies(res, admin);
    return this.toAuthResponse(admin);
  }

  async validateAdmin(
    email: string,
    plainPassword: string,
  ): Promise<AdminEntity | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call -- AdminsService cross-module resolution
    const adminWithPassword: AdminWithPassword | null =
      await this.adminsService.findAdminByEmailWithPassword(email);
    if (!adminWithPassword) return null;
    const isMatch = await bcrypt.compare(
      plainPassword,
      adminWithPassword.password,
    );
    if (!isMatch) return null;
    return new AdminEntity({
      id: adminWithPassword.id,
      email: adminWithPassword.email,
      name: adminWithPassword.name,
      role: adminWithPassword.role,
      isActive: adminWithPassword.isActive,
    });
  }

  async refreshTokens(
    adminId: string,
    refreshTokenFromCookie: string,
    res: Response,
  ): Promise<AuthenticatedAdminEntity> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call -- AdminsService cross-module resolution
    const admin = await this.adminsService.getAdminIfRefreshTokenMatches(
      adminId,
      refreshTokenFromCookie,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- AdminEntity from AdminsService
    await this.setCookies(res, admin);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- AdminEntity from AdminsService
    return this.toAuthResponse(admin);
  }

  async logout(adminId: string, res: Response): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- AdminsService cross-module resolution
    await this.adminsService.updateRefreshToken(adminId, null);
    const clearOptions = {
      httpOnly: true,
      sameSite: 'strict' as const,
      maxAge: 0,
    };
    res.cookie('access_token', '', { ...clearOptions, path: '/' });
    res.cookie('refresh_token', '', {
      ...clearOptions,
      path: REFRESH_COOKIE_PATH,
    });
  }
}
