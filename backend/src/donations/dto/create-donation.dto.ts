import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
const trimOptional = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const v = value.trim();
  return v === '' ? undefined : v;
};

export const DONATION_METHODS = ['TRANSFER', 'PROMPTPAY', 'CASH'];

export class CreateDonationDto {
  @Transform(trim)
  @IsNotEmpty({ message: 'กรุณากรอกชื่อผู้บริจาค' })
  @IsString()
  @MaxLength(100)
  donorName: string;

  @Transform(trimOptional)
  @IsOptional()
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email?: string;

  @Transform(trimOptional)
  @IsOptional()
  @Matches(/^[0-9+\-\s]{9,15}$/, { message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 9–15 หลัก' })
  phone?: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'จำนวนเงินต้องเป็นตัวเลข' })
  @Min(1, { message: 'จำนวนเงินต้องไม่น้อยกว่า 1 บาท' })
  @Max(1000000, { message: 'จำนวนเงินต้องไม่เกิน 1,000,000 บาท' })
  amount: number;

  @IsIn(DONATION_METHODS, { message: 'ช่องทางการบริจาคไม่ถูกต้อง' })
  method: string;

  @Transform(trimOptional)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
