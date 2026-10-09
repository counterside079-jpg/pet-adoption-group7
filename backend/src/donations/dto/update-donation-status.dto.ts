import { IsIn } from 'class-validator';

export const DONATION_STATUSES = ['PENDING', 'RECEIVED', 'CANCELLED'];

export class UpdateDonationStatusDto {
  @IsIn(DONATION_STATUSES, { message: 'สถานะต้องเป็น PENDING, RECEIVED หรือ CANCELLED' })
  status: string;
}
