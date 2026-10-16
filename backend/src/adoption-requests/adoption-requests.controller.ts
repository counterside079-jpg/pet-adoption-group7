import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AdoptionRequestsService } from './adoption-requests.service';
import { CreateAdoptionRequestDto } from './dto/create-adoption-request.dto';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { AdminGuard, AuthGuard } from '../auth/auth.guard';

// /api/adoption-requests
@Controller('adoption-requests')
export class AdoptionRequestsController {
  constructor(private readonly service: AdoptionRequestsService) {}

  // ส่งคำขอ: ต้องเข้าสู่ระบบ
  @Post()
  @UseGuards(AuthGuard)
  create(@Body() dto: CreateAdoptionRequestDto, @Req() req: any) {
    return this.service.create(dto, req.user);
  }

  // คำขอของฉัน: ต้องวางไว้ก่อน ':id' ไม่งั้น "mine" จะถูกมองเป็นรหัส
  @Get('mine')
  @UseGuards(AuthGuard)
  findMine(@Req() req: any) {
    return this.service.findMine(req.user.id);
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll(@Query('status') status?: string, @Query('q') q?: string) {
    return this.service.findAll(status, q);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.findOne(id, req.user);
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRequestStatusDto, @Req() req: any) {
    return this.service.updateStatus(id, dto.status, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.remove(id, req.user.id);
  }
}
