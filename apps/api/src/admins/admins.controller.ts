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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminEntity } from './entities/admin.entity';
import { ParseEmailPipe } from 'src/common/pipes/parse-email.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperadminGuard } from '../auth/guards/superadmin.guard';

@ApiTags('Admins')
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get all admins' })
  @ApiResponse({ status: 200, description: 'List of admins', type: [AdminEntity] })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  findAll(): Promise<AdminEntity[]> {
    return this.adminsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, SuperadminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Create admin', description: 'Requires super_admin role.' })
  @ApiResponse({ status: 201, description: 'Admin created', type: AdminEntity })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  @ApiForbiddenResponse({ description: 'Only super_admin can create admins' })
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.createAdmin(createAdminDto);
  }

  @Get('by-email/:email')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get admin by email' })
  @ApiResponse({ status: 200, description: 'Admin found', type: AdminEntity })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  findAdminByEmail(
    @Param('email', ParseEmailPipe) email: string,
  ): Promise<AdminEntity> {
    return this.adminsService.findAdminByEmail(email);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get admin by ID' })
  @ApiResponse({ status: 200, description: 'Admin found', type: AdminEntity })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  findById(@Param('id') id: string): Promise<AdminEntity> {
    return this.adminsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Update admin' })
  @ApiResponse({ status: 200, description: 'Admin updated', type: AdminEntity })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  updateAdmin(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ): Promise<AdminEntity> {
    return this.adminsService.updateAdmin(id, updateAdminDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Delete admin' })
  @ApiResponse({ status: 200, description: 'Admin deleted', type: AdminEntity })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing access token' })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  removeAdmin(@Param('id') id: string): Promise<AdminEntity> {
    return this.adminsService.removeAdmin(id);
  }
}
