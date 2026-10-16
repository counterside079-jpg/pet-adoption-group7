import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateDonationDto } from './dto/create-donation.dto';
import { ActivityLogService } from '../activity-logs/activity-log.service';

const DONATION_STATUS_TH: Record<string, string> = {
  PENDING: 'รอตรวจสอบยอด',
  RECEIVED: 'ได้รับแล้ว',
  CANCELLED: 'ยกเลิก',
};

@Injectable()
export class DonationsService {
  private prisma = new PrismaClient();

  constructor(private readonly logs: ActivityLogService) {}

  // ผู้ใช้แจ้งความประสงค์บริจาค (สถานะเริ่มต้น PENDING รอเจ้าหน้าที่ตรวจยอด)
  create(dto: CreateDonationDto) {
    return this.prisma.donation.create({
      data: {
        donorName: dto.donorName,
        email: dto.email ?? null,
        phone: dto.phone ?? null,
        amount: dto.amount,
        method: dto.method,
        message: dto.message ?? null,
      },
    });
  }

  findAll(status?: string) {
    const where = status && status !== 'ALL' ? { status } : {};
    return this.prisma.donation.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const donation = await this.prisma.donation.findUnique({ where: { id } });
    if (!donation) {
      throw new NotFoundException(`ไม่พบรายการบริจาครหัส #${id}`);
    }
    return donation;
  }

  async updateStatus(id: number, status: string, actorId: number) {
    const d = await this.findOne(id);
    const updated = await this.prisma.donation.update({ where: { id }, data: { status } });
    await this.logs.record(actorId, 'STATUS', 'DONATION', id, `เปลี่ยนการบริจาคของ ${d.donorName} (${d.amount.toLocaleString()} บาท) เป็น "${DONATION_STATUS_TH[status] ?? status}"`);
    return updated;
  }

  async remove(id: number, actorId: number) {
    const d = await this.findOne(id);
    await this.prisma.donation.delete({ where: { id } });
    await this.logs.record(actorId, 'DELETE', 'DONATION', id, `ลบรายการบริจาคของ ${d.donorName} (${d.amount.toLocaleString()} บาท)`);
    return { id };
  }
}
