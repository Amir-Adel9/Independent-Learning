import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminEntity } from './entities/admin.entity';
import { ParseEmailPipe } from 'src/common/pipes/parse-email.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperadminGuard } from '../auth/guards/superadmin.guard';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(): Promise<AdminEntity[]> {
    return this.adminsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, SuperadminGuard)
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.createAdmin(createAdminDto);
  }

  @Get('by-email/:email')
  @UseGuards(JwtAuthGuard)
  findAdminByEmail(
    @Param('email', ParseEmailPipe) email: string,
  ): Promise<AdminEntity> {
    return this.adminsService.findAdminByEmail(email);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findById(@Param('id') id: string): Promise<AdminEntity> {
    return this.adminsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateAdmin(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ): Promise<AdminEntity> {
    return this.adminsService.updateAdmin(id, updateAdminDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  removeAdmin(@Param('id') id: string): Promise<AdminEntity> {
    return this.adminsService.removeAdmin(id);
  }
}
