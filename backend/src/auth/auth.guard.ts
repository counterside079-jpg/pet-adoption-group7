import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

// ด่านตรวจที่ฝั่ง Backend: ต้องเข้าสู่ระบบ (มี token ที่ถูกต้อง) ถึงจะเรียก API นี้ได้
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = await this.auth.userFromRequest(req);
    if (!user) {
      throw new UnauthorizedException('กรุณาเข้าสู่ระบบก่อน');
    }
    req.user = user;
    return true;
  }
}

// ด่านตรวจเจ้าหน้าที่: ต้องเข้าสู่ระบบ และบัญชีต้องเป็น ADMIN
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = await this.auth.userFromRequest(req);
    if (!user) {
      throw new UnauthorizedException('กรุณาเข้าสู่ระบบด้วยบัญชีเจ้าหน้าที่');
    }
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('เฉพาะเจ้าหน้าที่เท่านั้น');
    }
    req.user = user;
    return true;
  }
}
