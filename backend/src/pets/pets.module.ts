import { Module } from '@nestjs/common';
import { PetsController, PetTypesController } from './pets.controller';
import { PetsService } from './pets.service';

@Module({
  controllers: [PetsController, PetTypesController],
  providers: [PetsService],
  exports: [PetsService],
})
export class PetsModule {}