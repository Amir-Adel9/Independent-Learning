import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { AdminEntity } from './entities/admin.entity';

import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

@Injectable()
export class AdminsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<AdminEntity[]> {
    const admins = await this.prisma.admin.findMany({
      orderBy: { email: 'asc' },
    });
    return admins.map((a) => new AdminEntity(a));
  }

  async findById(id: string): Promise<AdminEntity> {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });
    if (!admin) {
      throw new NotFoundException(`Admin with id ${id} not found`);
    }
    return new AdminEntity(admin);
  }

  async findAdminByEmailWithPassword(
    email: string,
  ): Promise<(AdminEntity & { password: string }) | null> {
    const admin = await this.prisma.admin.findUnique({
      where: { email: email.toLowerCase(), isActive: true },
    });
    if (!admin) return null;
    const entity = new AdminEntity(admin);
    return { ...entity, password: admin.password };
  }

  async findAdminByEmail(email: string): Promise<AdminEntity> {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      throw new NotFoundException(`Admin with email ${email} not found`);
    }
    return new AdminEntity(admin);
  }

  async updateRefreshToken(
    adminId: string,
    refreshToken: string | null,
  ): Promise<void> {
    const update = refreshToken
      ? { refreshToken: await bcrypt.hash(refreshToken, SALT_ROUNDS) }
      : { refreshToken: null };
    const updated = await this.prisma.admin.update({
      where: { id: adminId },
      data: update,
    });
    if (!updated) throw new BadRequestException('Invalid admin id');
  }

  async getAdminIfRefreshTokenMatches(
    adminId: string,
    refreshToken: string,
  ): Promise<AdminEntity> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin?.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const isMatch = await bcrypt.compare(refreshToken, admin.refreshToken);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return new AdminEntity(admin);
  }

  async createAdmin(createAdminDto: CreateAdminDto): Promise<AdminEntity> {
    const { password, ...adminData } = createAdminDto;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const admin = await this.prisma.admin.create({
      data: {
        email: adminData.email,
        name: adminData.name ?? '',
        role: adminData.role,
        password: hashedPassword,
        ...(adminData.isActive !== undefined && {
          isActive: adminData.isActive,
        }),
      },
    });
    return new AdminEntity(admin);
  }

  async updateAdmin(id: string, data: UpdateAdminDto): Promise<AdminEntity> {
    const updateData = { ...data };
    if (updateData.password) {
      (updateData as { password: string }).password = await bcrypt.hash(
        updateData.password,
        SALT_ROUNDS,
      );
    }
    const admin = await this.prisma.admin.update({
      where: { id },
      data: updateData,
    });
    return new AdminEntity(admin);
  }

  async removeAdmin(id: string): Promise<AdminEntity> {
    const admin = await this.prisma.admin.delete({ where: { id } });
    return new AdminEntity(admin);
  }
}
