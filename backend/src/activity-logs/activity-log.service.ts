import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export type LogTarget = 'PET' | 'ADOPTION_REQUEST' | 'DONATION' | 'USER';

// บันทึกประวัติการทำงานของเจ้าหน้าที่ (ใครทำอะไร กับข้อมูลไหน เมื่อไร)
@Injectable()
export class ActivityLogService {
  private prisma = new PrismaClient();

  // บันทึกไม่สำเร็จต้องไม่ทำให้งานหลักพัง จึงจับ error ไว้
  async record(
    userId: number | null | undefined,
    action: string,
    targetType: LogTarget,
    targetId: number | null,
    detail: string,
  ): Promise<void> {
    try {
      await this.prisma.activityLog.create({
        data: { userId: userId ?? null, action, targetType, targetId, detail },
      });
    } catch (e) {
      console.error('บันทึกประวัติการทำงานไม่สำเร็จ', e);
    }
  }

  // ค้นประวัติย้อนหลัง: กรองตามประเภทข้อมูล รหัส ผู้ทำ หรือคำค้นในรายละเอียด
  findAll(filter: { targetType?: string; targetId?: number; userId?: number; q?: string }) {
    const where: any = {};
    if (filter.targetType && filter.targetType !== 'ALL') where.targetType = filter.targetType;
    if (filter.targetId) where.targetId = filter.targetId;
    if (filter.userId) where.userId = filter.userId;
    if (filter.q && filter.q.trim()) {
      const q = filter.q.trim();
      where.OR = [
        { detail: { contains: q, mode: 'insensitive' } },
        { user: { fullName: { contains: q, mode: 'insensitive' } } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }
    return this.prisma.activityLog.findMany({
      where,
      include: { user: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }
}
