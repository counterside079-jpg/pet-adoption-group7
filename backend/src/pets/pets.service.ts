import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

export const STATUSES = ['AVAILABLE', 'PENDING', 'ADOPTED', 'UNAVAILABLE'];

@Injectable()
export class PetsService {
  private prisma = new PrismaClient();

  // 1. ดึงข้อมูลทั้งหมด + ค้นหา + กรอง (default: AVAILABLE, รองรับ status=ALL, ป้องกัน typeId=NaN)
  async findAll(search?: string, typeId?: string, status?: string) {
    const whereCondition: any = {};

    // ค้นหาตามชื่อหรือสายพันธุ์ (เพิ่ม mode: 'insensitive' เพื่อค้นหาแบบไม่สนตัวพิมพ์เล็ก-ใหญ่)
    if (search && search.trim()) {
      const keyword = search.trim();
      whereCondition.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { breed: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // ตรวจสอบ typeId ถ้าไม่ใช่ 'ALL' และไม่ใช่ตัวเลข ให้ตอบกลับเป็น 400 Bad Request
    if (typeId && typeId !== 'ALL' && typeId.trim() !== '') {
      const parsedTypeId = Number(typeId);
      if (isNaN(parsedTypeId)) {
        throw new BadRequestException('รหัสประเภทสัตว์เลี้ยง (typeId) ต้องเป็นตัวเลข');
      }
      whereCondition.petTypeId = parsedTypeId;
    }

    // จัดการสถานะ: default เป็น AVAILABLE, ถ้าเป็น 'ALL' จะไม่กรองสถานะ
    const targetStatus = status && status.trim() !== '' ? status.trim() : 'AVAILABLE';
    if (targetStatus !== 'ALL') {
      whereCondition.status = targetStatus;
    }

    return this.prisma.pet.findMany({
      where: whereCondition,
      include: { petType: true },
      orderBy: { id: 'desc' },
    });
  }

  // 2. ดึงข้อมูลรายตัว
  async findOne(id: number) {
    const pet = await this.prisma.pet.findUnique({
      where: { id: Number(id) },
      include: { petType: true },
    });

    if (!pet) {
      throw new NotFoundException(`ไม่พบข้อมูลสัตว์เลี้ยงรหัส #${id}`);
    }
    return pet;
  }

  // 3. เพิ่มข้อมูลใหม่ + ดักจับ P2003 (กรณีไม่พบ petTypeId) ตอบกลับ 400
  async create(dto: CreatePetDto) {
    try {
      return await this.prisma.pet.create({
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
        include: { petType: true },
      });
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
  async update(id: number, dto: UpdatePetDto) {
    const existingPet = await this.findOne(id);

    // ตรวจสอบ confirmReopen จาก DTO
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
      return await this.prisma.pet.update({
        where: { id: Number(id) },
        data: updateData,
        include: { petType: true },
      });
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

  // 5. ลบข้อมูลสัตว์เลี้ยง
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.pet.delete({
      where: { id: Number(id) },
    });
  }

  // 6. ดึงรายการประเภทสัตว์เลี้ยงทั้งหมด (สำหรับ Dropdown)
  async findPetTypes() {
    return this.prisma.petType.findMany({
      orderBy: { id: 'asc' },
    });
  }
}