import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AdminRole } from '@prisma/client';
import { AdminEntity } from '../../admins/entities/admin.entity';

@Injectable()
export class SuperadminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user?: AdminEntity }>();
    const user = req.user;
    if (!user || user.role !== AdminRole.super_admin) {
      throw new ForbiddenException('Only super_admin can perform this action');
    }
    return true;
  }
}
