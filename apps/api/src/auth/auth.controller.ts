import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AdminEntity } from '../admins/entities/admin.entity';
import { AuthService } from './auth.service';
import { AuthenticatedAdminEntity } from './entities/authenticated-admin.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthenticatedAdminEntity> {
    return this.authService.login(loginDto, res);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(
    @Request()
    req: { user: { sub: string }; cookies?: { refresh_token?: string } },
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthenticatedAdminEntity> {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.authService.refreshTokens(req.user.sub, refreshToken, res);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async logout(
    @Request() req: { user: AdminEntity },
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.logout(req.user.id, res);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req: { user: AdminEntity }): AuthenticatedAdminEntity {
    return this.authService.toAuthResponse(req.user);
  }
}
