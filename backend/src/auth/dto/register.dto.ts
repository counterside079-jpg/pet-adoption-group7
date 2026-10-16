import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const trimOptional = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const v = value.trim();
  return v === '' ? undefined : v;
};

export class RegisterDto {
  @Transform(trim)
  @IsNotEmpty({ message: 'กรุณากรอกชื่อ-นามสกุล' })
  @IsString()
  @MaxLength(150)
  fullName: string;

  @Transform(trim)
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })
  @MaxLength(100)
  password: string;

  @Transform(trimOptional)
  @IsOptional()
  @Matches(/^[0-9+\-\s]{9,15}$/, { message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 9–15 หลัก' })
  phone?: string;
}
