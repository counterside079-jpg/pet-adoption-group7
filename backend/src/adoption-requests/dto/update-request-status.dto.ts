import { IsIn } from 'class-validator';

export const REQUEST_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

export class UpdateRequestStatusDto {
  @IsIn(REQUEST_STATUSES, { message: 'สถานะคำขอต้องเป็น PENDING, APPROVED หรือ REJECTED' })
  status: string;
}
