import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateAdoptionRequestDto } from './dto/create-adoption-request.dto';
import { ActivityLogService } from '../activity-logs/activity-log.service';
import { AuthUser } from '../auth/auth.service';

// สถานะสัตว์ที่ยังรับคำขอได้
const OPEN_PET_STATUSES = ['AVAILABLE', 'PENDING'];

const REQUEST_STATUS_TH: Record<string, string> = {
  PENDING: 'รอพิจารณา',
  APPROVED: 'อนุมัติ',
  REJECTED: 'ไม่อนุมัติ',
};

const WITH_PET = {
  pet: { include: { petType: true, images: { select: { id: true }, orderBy: { id: 'asc' as const } } } },
  user: { select: { id: true, fullName: true, email: true } },
};

@Injectable()
export class AdoptionRequestsService {
  private prisma = new PrismaClient();

  constructor(private readonly logs: ActivityLogService) {}

  // ผู้ใช้ (ต้องเข้าสู่ระบบ) ส่งแบบฟอร์มขอรับเลี้ยง คำขอผูกกับบัญชีเพื่อกลับมาติดตามสถานะได้
  // Business Rule: ขอได้เฉพาะสัตว์ที่ยัง "พร้อมรับเลี้ยง" หรือ "กำลังรอพิจารณา" และห้ามส่งซ้ำ
  async create(dto: CreateAdoptionRequestDto, user: AuthUser) {
    const pet = await this.prisma.pet.findUnique({ where: { id: dto.petId } });
    if (!pet || pet.deletedAt) {
      throw new NotFoundException(`ไม่พบสัตว์เลี้ยงรหัส #${dto.petId}`);
    }
    if (!OPEN_PET_STATUSES.includes(pet.status)) {
      throw new BadRequestException(`"${pet.name}" ไม่เปิดรับคำขอรับเลี้ยงแล้ว`);
    }

    const duplicate = await this.prisma.adoptionRequest.findFirst({
      where: { petId: pet.id, userId: user.id, status: 'PENDING' },
    });
    if (duplicate) {
      throw new BadRequestException(
        `คุณส่งคำขอรับเลี้ยง "${pet.name}" ไว้แล้ว และกำลังรอพิจารณา ดูสถานะได้ที่หน้า "คำขอของฉัน"`,
      );
    }

    return this.prisma.adoptionRequest.create({
      data: {
        petId: dto.petId,
        userId: user.id,
        prefix: dto.prefix ?? null,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        address: dto.address ?? null,
        city: dto.city,
        postalCode: dto.postalCode,
        country: dto.country,
        socialContact: dto.socialContact ?? null,
        nearestAirport: dto.nearestAirport ?? null,
        householdMembers: dto.householdMembers ?? null,
        householdAgreement: dto.householdAgreement ?? null,
        otherPets: dto.otherPets ?? null,
        housingDetails: dto.housingDetails ?? null,
        occupationAndHours: dto.occupationAndHours ?? null,
        adoptionReason: dto.adoptionReason,
        receiveNews: dto.receiveNews ?? false,
      },
      include: WITH_PET,
    });
  }

  // คำขอของผู้ใช้ที่เข้าสู่ระบบอยู่ (หน้า "คำขอของฉัน")
  findMine(userId: number) {
    return this.prisma.adoptionRequest.findMany({
      where: { userId },
      include: WITH_PET,
      orderBy: { createdAt: 'desc' },
    });
  }

  // หน้า Admin ดูคำขอทั้งหมด (ใหม่สุดขึ้นก่อน) กรองตามสถานะ และค้นจากชื่อผู้ขอ/อีเมล/เบอร์/ชื่อสัตว์ได้
  async findAll(status?: string, q?: string) {
    const where: any = status && status !== 'ALL' ? { status } : {};
    if (q && q.trim()) {
      const k = q.trim();
      where.OR = [
        { firstName: { contains: k, mode: 'insensitive' } },
        { lastName: { contains: k, mode: 'insensitive' } },
        { email: { contains: k, mode: 'insensitive' } },
        { phone: { contains: k } },
        { pet: { name: { contains: k, mode: 'insensitive' } } },
      ];
    }
    return this.prisma.adoptionRequest.findMany({
      where,
      include: WITH_PET,
      orderBy: { createdAt: 'desc' },
    });
  }

  // เจ้าหน้าที่ดูได้ทุกคำขอ ผู้ใช้ดูได้เฉพาะคำขอของตัวเอง
  async findOne(id: number, user?: AuthUser) {
    const request = await this.prisma.adoptionRequest.findUnique({
      where: { id },
      include: WITH_PET,
    });
    if (!request) {
      throw new NotFoundException(`ไม่พบคำขอรับเลี้ยงรหัส #${id}`);
    }
    if (user && user.role !== 'ADMIN' && request.userId !== user.id) {
      throw new ForbiddenException('ดูได้เฉพาะคำขอของตัวเอง');
    }
    return request;
  }

  // เปลี่ยนสถานะคำขอ (เจ้าหน้าที่)
  // Business Rule: อนุมัติ (APPROVED) แล้ว สัตว์ตัวนั้นเปลี่ยนเป็น "มีบ้านแล้ว" (ADOPTED)
  // และคำขออื่นของสัตว์ตัวเดียวกันที่ยังรอพิจารณา จะถูกปฏิเสธอัตโนมัติ
  // ถ้ายกเลิกการอนุมัติ (APPROVED -> สถานะอื่น) สัตว์กลับเป็น "พร้อมรับเลี้ยง"
  async updateStatus(id: number, status: string, actorId: number) {
    const request = await this.findOne(id);
    const who = `${request.firstName} ${request.lastName}`;
    const petName = request.pet.name;

    if (status === request.status) {
      return request;
    }

    if (status === 'APPROVED') {
      if (request.pet.status === 'ADOPTED') {
        throw new BadRequestException(`"${petName}" มีบ้านแล้ว อนุมัติคำขอนี้ไม่ได้`);
      }

      const [updated, , rejected] = await this.prisma.$transaction([
        this.prisma.adoptionRequest.update({
          where: { id },
          data: { status: 'APPROVED' },
          include: WITH_PET,
        }),
        this.prisma.pet.update({
          where: { id: request.petId },
          data: { status: 'ADOPTED' },
        }),
        this.prisma.adoptionRequest.updateMany({
          where: { petId: request.petId, status: 'PENDING', id: { not: id } },
          data: { status: 'REJECTED' },
        }),
      ]);
      const extra = rejected.count > 0 ? ` และปฏิเสธคำขออื่นอัตโนมัติ ${rejected.count} รายการ` : '';
      await this.logs.record(actorId, 'STATUS', 'ADOPTION_REQUEST', id, `อนุมัติคำขอของ ${who} รับเลี้ยง "${petName}" → สัตว์เป็น "มีบ้านแล้ว"${extra}`);
      return updated;
    }

    if (request.status === 'APPROVED' && request.pet.status === 'ADOPTED') {
      const [updated] = await this.prisma.$transaction([
        this.prisma.adoptionRequest.update({ where: { id }, data: { status }, include: WITH_PET }),
        this.prisma.pet.update({ where: { id: request.petId }, data: { status: 'AVAILABLE' } }),
      ]);
      await this.logs.record(actorId, 'STATUS', 'ADOPTION_REQUEST', id, `ยกเลิกการอนุมัติคำขอของ ${who} (เป็น "${REQUEST_STATUS_TH[status] ?? status}") → "${petName}" กลับเป็น "พร้อมรับเลี้ยง"`);
      return updated;
    }

    const updated = await this.prisma.adoptionRequest.update({
      where: { id },
      data: { status },
      include: WITH_PET,
    });
    await this.logs.record(actorId, 'STATUS', 'ADOPTION_REQUEST', id, `เปลี่ยนคำขอของ ${who} ("${petName}") เป็น "${REQUEST_STATUS_TH[status] ?? status}"`);
    return updated;
  }

  async remove(id: number, actorId: number) {
    const request = await this.findOne(id);
    await this.prisma.adoptionRequest.delete({ where: { id } });
    await this.logs.record(actorId, 'DELETE', 'ADOPTION_REQUEST', id, `ลบคำขอของ ${request.firstName} ${request.lastName} ("${request.pet.name}")`);
    return { id };
  }
}
