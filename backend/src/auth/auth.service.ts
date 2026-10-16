import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

declare const process: any;

// ข้อมูลผู้ใช้ที่แนบไปกับทุกคำขอหลังตรวจ token แล้ว (ไม่มีรหัสผ่าน)
export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  role: 'USER' | 'ADMIN';
}

const TOKEN_AGE_SECONDS = 7 * 24 * 60 * 60; // token ใช้ได้ 7 วัน

// ใช้ crypto ของ Node.js ทั้งหมด (ไม่ต้องติดตั้งแพ็กเกจเพิ่ม)
// - รหัสผ่านเก็บเป็น scrypt hash + salt ไม่เก็บรหัสจริง
// - token เป็นรูปแบบเดียวกับ JWT (header.payload.signature) เซ็นด้วย HMAC-SHA256
@Injectable()
export class AuthService {
  private prisma = new PrismaClient();
  private secret: string = process.env.JWT_SECRET || 'banphakjai-dev-secret-change-me';

  // ---------- รหัสผ่าน ----------
  static hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  static verifyPassword(password: string, stored: string): boolean {
    const [salt, hash] = (stored || '').split(':');
    if (!salt || !hash) return false;
    const test = scryptSync(password, salt, 64);
    const real = Buffer.from(hash, 'hex');
    return real.length === test.length && timingSafeEqual(real, test);
  }

  // ---------- token ----------
  private b64(input: string | Buffer): string {
    return Buffer.from(input).toString('base64url');
  }

  private sign(data: string): string {
    return createHmac('sha256', this.secret).update(data).digest('base64url');
  }

  createToken(user: { id: number; role: string }): string {
    const header = this.b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = this.b64(
      JSON.stringify({
        sub: user.id,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + TOKEN_AGE_SECONDS,
      }),
    );
    return `${header}.${payload}.${this.sign(`${header}.${payload}`)}`;
  }

  // ตรวจ token แล้วคืนข้อมูลผู้ใช้ปัจจุบันจากฐานข้อมูล (token ปลอม/หมดอายุ = null)
  async verifyToken(token: string): Promise<AuthUser | null> {
    const parts = (token || '').split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expected = this.sign(`${header}.${payload}`);
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    let data: any;
    try {
      data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    } catch {
      return null;
    }
    if (!data?.sub || !data?.exp || data.exp < Math.floor(Date.now() / 1000)) return null;

    const user = await this.prisma.user.findUnique({ where: { id: Number(data.sub) } });
    return user ? this.toAuthUser(user) : null;
  }

  // อ่าน token จาก header "Authorization: Bearer xxx" (ไม่มี/ผิด = null ไม่ throw)
  async userFromRequest(req: any): Promise<AuthUser | null> {
    const header: string = req?.headers?.authorization || '';
    if (!header.startsWith('Bearer ')) return null;
    return this.verifyToken(header.slice(7).trim());
  }

  private toAuthUser(user: any): AuthUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone ?? null,
      role: user.role === 'ADMIN' ? 'ADMIN' : 'USER',
    };
  }

  // ---------- สมัคร / เข้าสู่ระบบ ----------
  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new ConflictException('อีเมลนี้สมัครสมาชิกไว้แล้ว กรุณาเข้าสู่ระบบ');
    }
    const user = await this.prisma.user.create({
      data: {
        email,
        fullName: dto.fullName,
        phone: dto.phone ?? null,
        passwordHash: AuthService.hashPassword(dto.password),
        role: 'USER',
      },
    });
    return { token: this.createToken(user), user: this.toAuthUser(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user || !AuthService.verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
    return { token: this.createToken(user), user: this.toAuthUser(user) };
  }

  // ---------- จัดการบัญชีเจ้าหน้าที่ ----------
  async listAdmins() {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      orderBy: { id: 'asc' },
    });
    return admins.map((u: any) => ({ ...this.toAuthUser(u), createdAt: u.createdAt }));
  }

  async createAdmin(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) {
      // มีบัญชีผู้ใช้อยู่แล้ว -> ยกระดับเป็นเจ้าหน้าที่ (รหัสผ่านเดิมของเขาไม่เปลี่ยน)
      if (exists.role === 'ADMIN') {
        throw new ConflictException('อีเมลนี้เป็นเจ้าหน้าที่อยู่แล้ว');
      }
      const updated = await this.prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
      return this.toAuthUser(updated);
    }
    const user = await this.prisma.user.create({
      data: {
        email,
        fullName: dto.fullName,
        phone: dto.phone ?? null,
        passwordHash: AuthService.hashPassword(dto.password),
        role: 'ADMIN',
      },
    });
    return this.toAuthUser(user);
  }

  // ถอนสิทธิ์เจ้าหน้าที่ (กลับเป็นผู้ใช้ทั่วไป) ห้ามถอนตัวเอง กันระบบไม่มีแอดมินเหลือ
  async removeAdmin(id: number, currentUserId: number) {
    if (id === currentUserId) {
      throw new BadRequestException('ถอนสิทธิ์บัญชีของตัวเองไม่ได้');
    }
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== 'ADMIN') {
      throw new NotFoundException('ไม่พบบัญชีเจ้าหน้าที่นี้');
    }
    const updated = await this.prisma.user.update({ where: { id }, data: { role: 'USER' } });
    return this.toAuthUser(updated);
  }
}
