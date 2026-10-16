import { Module } from '@nestjs/common';
import { PetImagesController, PetsController, PetTypesController } from './pets.controller';
import { PetsService } from './pets.service';

@Module({
  controllers: [PetsController, PetImagesController, PetTypesController],
  providers: [PetsService],
  exports: [PetsService],
})
export class PetsModule {}
