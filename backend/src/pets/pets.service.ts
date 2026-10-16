import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { ActivityLogService } from '../activity-logs/activity-log.service';

export const STATUSES = ['AVAILABLE', 'PENDING', 'ADOPTED', 'UNAVAILABLE'];

const STATUS_TH: Record<string, string> = {
  AVAILABLE: 'พร้อมรับเลี้ยง',
  PENDING: 'กำลังรอพิจารณา',
  ADOPTED: 'มีบ้านแล้ว',
  UNAVAILABLE: 'ไม่พร้อมรับเลี้ยง',
};

const MAX_IMAGES_PER_PET = 10;

// ส่งเฉพาะรหัสรูปไปกับข้อมูลสัตว์ (ตัวไฟล์รูปโหลดแยกทาง GET /api/pet-images/:id)
const IMAGE_LIST = {
  select: { id: true },
  orderBy: [{ sortOrder: 'asc' as const }, { id: 'asc' as const }],
};

export interface PetQuery {
  search?: string;
  typeId?: string;
  status?: string;
  archived?: string; // เฉพาะเจ้าหน้าที่: only = เฉพาะที่ลบแล้ว, include = รวมที่ลบแล้ว
}

@Injectable()
export class PetsService {
  private prisma = new PrismaClient();

  constructor(private readonly logs: ActivityLogService) {}

  // คำค้น 1 คำ ค้นได้จากชื่อ สายพันธุ์ ประเภท เพศ คำอธิบาย และบันทึกสุขภาพ
  private termCondition(term: string): any {
    const or: any[] = [
      { name: { contains: term, mode: 'insensitive' } },
      { breed: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
      { healthNote: { contains: term, mode: 'insensitive' } },
      { petType: { name: { contains: term, mode: 'insensitive' } } },
    ];
    const t = term.toLowerCase();
    if (t.includes('เมีย') || t === 'female') {
      or.push({ gender: 'FEMALE' });
    } else if (t.includes('ผู้') || t === 'male') {
      or.push({ gender: 'MALE' });
    } else if (t.includes('ไม่ระบุ') || t === 'unknown') {
      or.push({ gender: 'UNKNOWN' });
    }
    return { OR: or };
  }

  // 1. รายการสัตว์ + ค้นหา + กรอง
  // ผู้ใช้ทั่วไป: เห็นเฉพาะสัตว์ที่พร้อมรับเลี้ยงและยังไม่ถูกลบ (Business Rule)
  // เจ้าหน้าที่: เลือกสถานะได้ (ALL = ทุกสถานะ) และค้นข้อมูลที่ลบไปแล้วย้อนหลังได้
  async findAll(query: PetQuery, isAdmin: boolean) {
    const where: any = {};

    // คำค้นหลายคำ เช่น "แมว เมีย" = ต้องตรงทุกคำ
    const terms = (query.search || '').trim().split(/\s+/).filter(Boolean);
    if (terms.length) {
      where.AND = terms.map((t) => this.termCondition(t));
    }

    if (query.typeId && query.typeId !== 'ALL' && query.typeId.trim() !== '') {
      const parsedTypeId = Number(query.typeId);
      if (isNaN(parsedTypeId)) {
        throw new BadRequestException('รหัสประเภทสัตว์เลี้ยง (typeId) ต้องเป็นตัวเลข');
      }
      where.petTypeId = parsedTypeId;
    }

    if (!isAdmin) {
      where.status = 'AVAILABLE';
      where.deletedAt = null;
    } else {
      const targetStatus = query.status && query.status.trim() !== '' ? query.status.trim() : 'AVAILABLE';
      if (targetStatus !== 'ALL') where.status = targetStatus;
      if (query.archived === 'only') where.deletedAt = { not: null };
      else if (query.archived !== 'include') where.deletedAt = null;
    }

    return this.prisma.pet.findMany({
      where,
      include: { petType: true, images: IMAGE_LIST },
      orderBy: { id: 'desc' },
    });
  }

  // 2. ข้อมูลรายตัว (ตัวที่ถูกลบแล้ว ผู้ใช้ทั่วไปเปิดไม่ได้ แต่เจ้าหน้าที่เปิดดูย้อนหลังได้)
  async findOne(id: number, isAdmin = true) {
    const pet = await this.prisma.pet.findUnique({
      where: { id: Number(id) },
      include: { petType: true, images: IMAGE_LIST },
    });

    if (!pet || (!isAdmin && pet.deletedAt)) {
      throw new NotFoundException(`ไม่พบข้อมูลสัตว์เลี้ยงรหัส #${id}`);
    }
    return pet;
  }

  // ประวัติย้อนหลังของสัตว์ 1 ตัว: คำขอรับเลี้ยงทั้งหมด + ประวัติการแก้ไขโดยเจ้าหน้าที่
  async history(id: number) {
    const pet = await this.findOne(id, true);
    const [requests, logs] = await Promise.all([
      this.prisma.adoptionRequest.findMany({
        where: { petId: pet.id },
        include: { user: { select: { id: true, fullName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.logs.findAll({ targetType: 'PET', targetId: pet.id }),
    ]);
    return { pet, requests, logs };
  }

  // 3. เพิ่มข้อมูลใหม่ + ดักจับ P2003 (กรณีไม่พบ petTypeId) ตอบกลับ 400
  async create(dto: CreatePetDto, actorId: number) {
    try {
      const pet = await this.prisma.pet.create({
        data: {
          name: dto.name,
          petTypeId: Number(dto.petTypeId),
          gender: dto.gender || 'UNKNOWN',
          ageMonths: Number(dto.ageMonths),
          weightKg: dto.weightKg ? Number(dto.weightKg) : null,
          healthNote: dto.healthNote || null,
          arrivedDate: dto.arrivedDate ? new Date(dto.arrivedDate) : null,
          status: dto.status || 'AVAILABLE',
          breed: dto.breed || null,
          description: dto.description || null,
          imageUrl: dto.imageUrl || null,
        },
        include: { petType: true, images: IMAGE_LIST },
      });
      await this.logs.record(actorId, 'CREATE', 'PET', pet.id, `เพิ่มสัตว์ "${pet.name}" (${pet.petType?.name ?? '-'})`);
      return pet;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'ไม่พบประเภทสัตว์เลี้ยงที่ระบุ (petTypeId ไม่ถูกต้อง)',
        );
      }
      throw error;
    }
  }

  // 4. แก้ไขข้อมูล + ตรวจสอบสถานะ ADOPTED -> AVAILABLE (ต้องมี confirmReopen)
  async update(id: number, dto: UpdatePetDto, actorId: number) {
    const existingPet = await this.findOne(id, true);

    const confirmReopen = (dto as any).confirmReopen;

    if (
      existingPet.status === 'ADOPTED' &&
      dto.status === 'AVAILABLE' &&
      !confirmReopen
    ) {
      throw new BadRequestException(
        'ต้องยืนยันการเปิดรับเลี้ยงใหม่ (confirmReopen) ก่อนเปลี่ยนสถานะจาก ADOPTED เป็น AVAILABLE',
      );
    }

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.petTypeId !== undefined) updateData.petTypeId = Number(dto.petTypeId);
    if (dto.gender !== undefined) updateData.gender = dto.gender;
    if (dto.ageMonths !== undefined) updateData.ageMonths = Number(dto.ageMonths);
    if (dto.weightKg !== undefined) {
      updateData.weightKg = dto.weightKg ? Number(dto.weightKg) : null;
    }
    if (dto.breed !== undefined) updateData.breed = dto.breed || null;
    if (dto.description !== undefined) updateData.description = dto.description || null;
    if (dto.healthNote !== undefined) updateData.healthNote = dto.healthNote || null;
    if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl || null;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.arrivedDate !== undefined) {
      updateData.arrivedDate = dto.arrivedDate ? new Date(dto.arrivedDate) : null;
    }

    try {
      const pet = await this.prisma.pet.update({
        where: { id: Number(id) },
        data: updateData,
        include: { petType: true, images: IMAGE_LIST },
      });
      const statusNote =
        dto.status && dto.status !== existingPet.status
          ? ` (สถานะ ${STATUS_TH[existingPet.status] ?? existingPet.status} → ${STATUS_TH[dto.status] ?? dto.status})`
          : '';
      await this.logs.record(actorId, 'UPDATE', 'PET', pet.id, `แก้ไขข้อมูล "${pet.name}"${statusNote}`);
      return pet;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'ไม่พบประเภทสัตว์เลี้ยงที่ระบุ (petTypeId ไม่ถูกต้อง)',
        );
      }
      throw error;
    }
  }

  // 5. ลบแบบเก็บถาวร: หายจากหน้าเว็บ แต่ข้อมูลและคำขอเดิมยังอยู่ ค้นย้อนหลังและกู้คืนได้
  async remove(id: number, actorId: number) {
    const pet = await this.findOne(id, true);
    if (pet.deletedAt) {
      throw new BadRequestException(`"${pet.name}" ถูกลบไปแล้ว`);
    }
    const updated = await this.prisma.pet.update({
      where: { id: pet.id },
      data: { deletedAt: new Date() },
    });
    await this.logs.record(actorId, 'DELETE', 'PET', pet.id, `ลบ "${pet.name}" (ย้ายไปเก็บถาวร)`);
    return updated;
  }

  // 6. กู้คืนสัตว์ที่ถูกลบ
  async restore(id: number, actorId: number) {
    const pet = await this.findOne(id, true);
    if (!pet.deletedAt) {
      throw new BadRequestException(`"${pet.name}" ไม่ได้ถูกลบ`);
    }
    const updated = await this.prisma.pet.update({
      where: { id: pet.id },
      data: { deletedAt: null },
      include: { petType: true, images: IMAGE_LIST },
    });
    await this.logs.record(actorId, 'RESTORE', 'PET', pet.id, `กู้คืน "${pet.name}"`);
    return updated;
  }

  // 7. รายการประเภทสัตว์เลี้ยงทั้งหมด (สำหรับปุ่มกรองและ Dropdown)
  async findPetTypes() {
    return this.prisma.petType.findMany({
      orderBy: { id: 'asc' },
    });
  }

  // ---------- รูปภาพ ----------
  async addImages(petId: number, files: any[], actorId: number) {
    const pet = await this.findOne(petId, true);
    if (!files || files.length === 0) {
      throw new BadRequestException('กรุณาเลือกรูปอย่างน้อย 1 รูป');
    }
    const bad = files.find((f) => !String(f.mimetype || '').startsWith('image/'));
    if (bad) {
      throw new BadRequestException(`ไฟล์ "${bad.originalname}" ไม่ใช่รูปภาพ`);
    }
    const current = await this.prisma.petImage.count({ where: { petId: pet.id } });
    if (current + files.length > MAX_IMAGES_PER_PET) {
      throw new BadRequestException(
        `สัตว์ 1 ตัวมีรูปได้ไม่เกิน ${MAX_IMAGES_PER_PET} รูป (ตอนนี้มี ${current} รูป)`,
      );
    }

    await this.prisma.$transaction(
      files.map((f, i) =>
        this.prisma.petImage.create({
          data: { petId: pet.id, data: f.buffer, mimeType: f.mimetype, sortOrder: current + i },
        }),
      ),
    );
    await this.logs.record(actorId, 'UPLOAD_IMAGE', 'PET', pet.id, `เพิ่มรูป ${files.length} รูปให้ "${pet.name}"`);
    return this.findOne(pet.id, true);
  }

  async getImage(imageId: number) {
    const image = await this.prisma.petImage.findUnique({ where: { id: imageId } });
    if (!image) {
      throw new NotFoundException('ไม่พบรูปภาพ');
    }
    return image;
  }

  async removeImage(imageId: number, actorId: number) {
    const image = await this.prisma.petImage.findUnique({
      where: { id: imageId },
      include: { pet: { select: { id: true, name: true } } },
    });
    if (!image) {
      throw new NotFoundException('ไม่พบรูปภาพ');
    }
    await this.prisma.petImage.delete({ where: { id: imageId } });
    await this.logs.record(actorId, 'DELETE_IMAGE', 'PET', image.pet.id, `ลบรูป 1 รูปของ "${image.pet.name}"`);
    return { id: imageId };
  }
}
