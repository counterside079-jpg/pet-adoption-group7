import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

// ตัดช่องว่างหน้า-หลังทุกช่องที่เป็นข้อความ และเปลี่ยน "" เป็น undefined สำหรับช่องไม่บังคับ
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
const trimOptional = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const v = value.trim();
  return v === '' ? undefined : v;
};

export class CreateAdoptionRequestDto {
  @Type(() => Number)
  @IsInt({ message: 'petId ต้องเป็นจำนวนเต็ม' })
  petId: number;

  @Transform(trimOptional)
  @IsOptional()
  @IsString()
  @MaxLength(20)
  prefix?: string;

  @Transform(trim)
  @IsNotEmpty({ message: 'กรุณากรอกชื่อ' })
  @IsString()
  @MaxLength(100)
  firstName: string;

  @Transform(trim)
  @IsNotEmpty({ message: 'กรุณากรอกนามสกุล' })
  @IsString()
  @MaxLength(100)
  lastName: string;

  @Transform(trim)
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email: string;

  @Transform(trim)
  @Matches(/^[0-9+\-\s]{9,15}$/, { message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 9–15 หลัก' })
  phone: string;

  @Transform(trimOptional)
  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @Transform(trim)
  @IsNotEmpty({ message: 'กรุณากรอกเมือง / จังหวัด' })
  @IsString()
  @MaxLength(100)
  city: string;

  @Transform(trim)
  @IsNotEmpty({ message: 'กรุณากรอกรหัสไปรษณีย์' })
  @IsString()
  @MaxLength(20)
  postalCode: string;

  @Transform(trim)
  @IsNotEmpty({ message: 'กรุณาเลือกประเทศ' })
  @IsString()
  @MaxLength(100)
  country: string;

  @Transform(trimOptional)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  socialContact?: string;

  @Transform(trimOptional)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nearestAirport?: string;

  @Transform(trimOptional)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  householdMembers?: string;

  @Transform(trimOptional)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  householdAgreement?: string;

  @Transform(trimOptional)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  otherPets?: string;

  @Transform(trimOptional)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  housingDetails?: string;

  @Transform(trimOptional)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  occupationAndHours?: string;

  @Transform(trim)
  @IsNotEmpty({ message: 'กรุณาบอกเหตุผลที่อยากรับเลี้ยง' })
  @IsString()
  @MaxLength(2000)
  adoptionReason: string;

  @IsOptional()
  @IsBoolean()
  receiveNews?: boolean;
}
