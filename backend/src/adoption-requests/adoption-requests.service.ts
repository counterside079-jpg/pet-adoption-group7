import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateAdoptionRequestDto } from './dto/create-adoption-request.dto';

// สถานะสัตว์ที่ยังรับคำขอได้
const OPEN_PET_STATUSES = ['AVAILABLE', 'PENDING'];

@Injectable()
export class AdoptionRequestsService {
  private prisma = new PrismaClient();

  // ผู้ใช้ส่งแบบฟอร์มขอรับเลี้ยง
  // Business Rule: ขอได้เฉพาะสัตว์ที่ยัง "พร้อมรับเลี้ยง" หรือ "กำลังรอพิจารณา"
  async create(dto: CreateAdoptionRequestDto) {
    const pet = await this.prisma.pet.findUnique({ where: { id: dto.petId } });
    if (!pet) {
      throw new NotFoundException(`ไม่พบสัตว์เลี้ยงรหัส #${dto.petId}`);
    }
    if (!OPEN_PET_STATUSES.includes(pet.status)) {
      throw new BadRequestException(`"${pet.name}" ไม่เปิดรับคำขอรับเลี้ยงแล้ว`);
    }

    return this.prisma.adoptionRequest.create({
      data: {
        petId: dto.petId,
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
      include: { pet: { include: { petType: true } } },
    });
  }

  // หน้า Admin ดูคำขอทั้งหมด (ใหม่สุดขึ้นก่อน) กรองตามสถานะได้
  async findAll(status?: string) {
    const where = status && status !== 'ALL' ? { status } : {};
    return this.prisma.adoptionRequest.findMany({
      where,
      include: { pet: { include: { petType: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const request = await this.prisma.adoptionRequest.findUnique({
      where: { id },
      include: { pet: { include: { petType: true } } },
    });
    if (!request) {
      throw new NotFoundException(`ไม่พบคำขอรับเลี้ยงรหัส #${id}`);
    }
    return request;
  }

  // เปลี่ยนสถานะคำขอ
  // Business Rule: อนุมัติ (APPROVED) แล้ว สัตว์ตัวนั้นเปลี่ยนเป็น "มีบ้านแล้ว" (ADOPTED)
  // และคำขออื่นของสัตว์ตัวเดียวกันที่ยังรอพิจารณา จะถูกปฏิเสธอัตโนมัติ
  async updateStatus(id: number, status: string) {
    const request = await this.findOne(id);

    if (status !== 'APPROVED') {
      return this.prisma.adoptionRequest.update({
        where: { id },
        data: { status },
        include: { pet: { include: { petType: true } } },
      });
    }

    if (request.pet.status === 'ADOPTED' && request.status !== 'APPROVED') {
      throw new BadRequestException(`"${request.pet.name}" มีบ้านแล้ว อนุมัติคำขอนี้ไม่ได้`);
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.adoptionRequest.update({
        where: { id },
        data: { status: 'APPROVED' },
        include: { pet: { include: { petType: true } } },
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
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.adoptionRequest.delete({ where: { id } });
  }
}
