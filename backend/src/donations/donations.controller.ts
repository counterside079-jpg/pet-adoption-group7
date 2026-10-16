import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationStatusDto } from './dto/update-donation-status.dto';
import { AdminGuard } from '../auth/auth.guard';

// /api/donations
@Controller('donations')
export class DonationsController {
  constructor(private readonly service: DonationsService) {}

  // แจ้งบริจาค: ใครก็ทำได้ ไม่ต้องเข้าสู่ระบบ
  @Post()
  create(@Body() dto: CreateDonationDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll(@Query('status') status?: string) {
    return this.service.findAll(status);
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDonationStatusDto, @Req() req: any) {
    return this.service.updateStatus(id, dto.status, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.remove(id, req.user.id);
  }
}
