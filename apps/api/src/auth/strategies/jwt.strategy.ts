import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import type { Env } from '../../common/config/env.validation';
import { AdminEntity } from '../../admins/entities/admin.entity';
import { AdminsService } from '../../admins/admins.service';

export type JwtPayload = {
  sub: string;
  email: string;
  name: string | null;
  role: string;
};

function cookieExtractor(req: Request | null): string | null {
  return req?.cookies?.access_token ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService<Env, true>,
    private readonly adminsService: AdminsService,
  ) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET', {
        infer: true,
      }),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: JwtPayload): Promise<AdminEntity> {
    const admin = await this.adminsService.findById(payload.sub);
    if (!admin) {
      throw new UnauthorizedException('User not found');
    }
    return admin;
  }
}
