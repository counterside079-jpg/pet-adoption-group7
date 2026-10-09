import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateDonationDto } from './dto/create-donation.dto';

@Injectable()
export class DonationsService {
  private prisma = new PrismaClient();

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

  async updateStatus(id: number, status: string) {
    await this.findOne(id);
    return this.prisma.donation.update({ where: { id }, data: { status } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.donation.delete({ where: { id } });
  }
}
