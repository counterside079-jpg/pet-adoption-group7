import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminGuard, AuthGuard } from './auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ActivityLogService } from '../activity-logs/activity-log.service';

// /api/auth : สมัครสมาชิก เข้าสู่ระบบ ดูข้อมูลตัวเอง
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: any) {
    return req.user;
  }
}

// /api/admins : เจ้าหน้าที่แต่ละคนมีบัญชีของตัวเอง (เฉพาะเจ้าหน้าที่จัดการได้)
@Controller('admins')
@UseGuards(AdminGuard)
export class AdminsController {
  constructor(
    private readonly auth: AuthService,
    private readonly logs: ActivityLogService,
  ) {}

  @Get()
  findAll() {
    return this.auth.listAdmins();
  }

  @Post()
  async create(@Body() dto: RegisterDto, @Req() req: any) {
    const admin = await this.auth.createAdmin(dto);
    await this.logs.record(req.user.id, 'CREATE', 'USER', admin.id, `เพิ่มบัญชีเจ้าหน้าที่ ${admin.fullName} (${admin.email})`);
    return admin;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const user = await this.auth.removeAdmin(id, req.user.id);
    await this.logs.record(req.user.id, 'DELETE', 'USER', user.id, `ถอนสิทธิ์เจ้าหน้าที่ ${user.fullName} (${user.email})`);
    return user;
  }
}

// /api/activity-logs : ประวัติการทำงานย้อนหลัง (เฉพาะเจ้าหน้าที่)
@Controller('activity-logs')
@UseGuards(AdminGuard)
export class ActivityLogsController {
  constructor(private readonly logs: ActivityLogService) {}

  @Get()
  findAll(
    @Query('targetType') targetType?: string,
    @Query('targetId') targetId?: string,
    @Query('userId') userId?: string,
    @Query('q') q?: string,
  ) {
    return this.logs.findAll({
      targetType,
      targetId: targetId ? Number(targetId) || undefined : undefined,
      userId: userId ? Number(userId) || undefined : undefined,
      q,
    });
  }
}
