import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminGuard, AuthGuard } from './auth.guard';
import { ActivityLogsController, AdminsController, AuthController } from './auth.controller';
import { ActivityLogService } from '../activity-logs/activity-log.service';

// @Global: ทุกโมดูลใช้ AuthService, ด่านตรวจ และตัวบันทึกประวัติได้โดยไม่ต้อง import ซ้ำ
@Global()
@Module({
  controllers: [AuthController, AdminsController, ActivityLogsController],
  providers: [AuthService, AuthGuard, AdminGuard, ActivityLogService],
  exports: [AuthService, AuthGuard, AdminGuard, ActivityLogService],
})
export class AuthModule {}
