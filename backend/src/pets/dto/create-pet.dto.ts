import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  Min,
  Max,
  IsNumber,
  IsIn,
  IsUrl,
  IsDateString,
} from 'class-validator';

export class CreatePetDto {
  // แก้ไข: ตัดช่องว่าง (trim) ก่อนตรวจสอบ เพื่อป้องกันการส่ง Spacebar ล้วน
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'ชื่อสัตว์เลี้ยงห้ามว่าง' })
  @IsString({ message: 'ชื่อสัตว์เลี้ยงต้องเป็นข้อความ' })
  name: string;

  @Type(() => Number)
  @IsInt({ message: 'petTypeId ต้องเป็นจำนวนเต็ม' })
  @IsNotEmpty({ message: 'ต้องระบุประเภทสัตว์เลี้ยง' })
  petTypeId: number;

  @IsOptional()
  @IsIn(['MALE', 'FEMALE', 'UNKNOWN'], { message: 'เพศต้องเป็น MALE, FEMALE หรือ UNKNOWN' })
  gender?: string;

  @Type(() => Number)
  @IsInt({ message: 'อายุต้องเป็นจำนวนเต็มเท่านั้น' })
  @Min(0, { message: 'อายุต้องไม่ต่ำกว่า 0 เดือน' })
  @Max(600, { message: 'อายุต้องไม่เกิน 600 เดือน' })
  @IsNotEmpty({ message: 'กรุณากรอกอายุ' })
  ageMonths: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'น้ำหนักต้องเป็นตัวเลข' })
  @Min(0, { message: 'น้ำหนักต้องไม่ติดลบ' })
  weightKg?: number;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsIn(['AVAILABLE', 'PENDING', 'ADOPTED', 'UNAVAILABLE'], { message: 'สถานะไม่ถูกต้อง' })
  status?: string;

  @IsOptional()
  @IsString()
  healthNote?: string;

  @IsOptional()
  @IsString()
  description?: string;

  // ถ้าไม่ใส่รูป (ส่ง "" หรือ null มา) ให้ข้ามการตรวจ URL
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsOptional()
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: 'URL รูปภาพต้องขึ้นต้นด้วย http:// หรือ https:// และเป็นรูปแบบที่ถูกต้อง' },
  )
  imageUrl?: string;

  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsDateString({}, { message: 'วันที่รับเข้าไม่ถูกต้อง (รูปแบบ YYYY-MM-DD)' })
  arrivedDate?: string;
}