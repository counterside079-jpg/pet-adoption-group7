import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { AuthService } from '../auth/auth.service';
import { AdminGuard } from '../auth/auth.guard';

const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // รูปละไม่เกิน 3 MB

@Controller('pets')
export class PetsController {
  constructor(
    private readonly petsService: PetsService,
    private readonly auth: AuthService,
  ) {}

  // ใครก็เรียกได้ แต่ถ้าเป็นเจ้าหน้าที่ (ส่ง token มา) จะเลือกสถานะและดูข้อมูลที่ลบแล้วได้
  @Get()
  async findAll(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('typeId') typeId?: string,
    @Query('petTypeId') petTypeId?: string,
    @Query('status') status?: string,
    @Query('archived') archived?: string,
  ) {
    const user = await this.auth.userFromRequest(req);
    const isAdmin = user?.role === 'ADMIN';
    return this.petsService.findAll(
      { search, typeId: typeId || petTypeId, status, archived },
      isAdmin,
    );
  }

  @Get(':id/history')
  @UseGuards(AdminGuard)
  history(@Param('id', ParseIntPipe) id: number) {
    return this.petsService.history(id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const user = await this.auth.userFromRequest(req);
    return this.petsService.findOne(id, user?.role === 'ADMIN');
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: CreatePetDto, @Req() req: any) {
    return this.petsService.create(dto, req.user.id);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePetDto, @Req() req: any) {
    return this.petsService.update(id, dto, req.user.id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  patchUpdate(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePetDto, @Req() req: any) {
    return this.petsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.petsService.remove(id, req.user.id);
  }

  @Post(':id/restore')
  @UseGuards(AdminGuard)
  restore(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.petsService.restore(id, req.user.id);
  }

  // อัปโหลดรูป (multipart/form-data ชื่อช่อง "files") ครั้งละไม่เกิน 10 รูป
  @Post(':id/images')
  @UseGuards(AdminGuard)
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: MAX_IMAGE_BYTES } }))
  addImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: any[],
    @Req() req: any,
  ) {
    return this.petsService.addImages(id, files, req.user.id);
  }
}

@Controller('pet-images')
export class PetImagesController {
  constructor(private readonly petsService: PetsService) {}

  // ส่งไฟล์รูปออกไปตรงๆ ใช้เป็น <img src="..."> ได้เลย
  @Get(':id')
  async getImage(@Param('id', ParseIntPipe) id: number, @Res() res: any) {
    const image = await this.petsService.getImage(id);
    res.set('Content-Type', image.mimeType);
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(Buffer.from(image.data));
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.petsService.removeImage(id, req.user.id);
  }
}

@Controller('pet-types')
export class PetTypesController {
  constructor(private readonly petsService: PetsService) {}

  @Get()
  findAll() {
    return this.petsService.findPetTypes();
  }
}
