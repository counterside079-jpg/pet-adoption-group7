import { Module } from '@nestjs/common';
import { PetsModule } from './pets/pets.module';
import { AdoptionRequestsModule } from './adoption-requests/adoption-requests.module';
import { DonationsModule } from './donations/donations.module';

@Module({
  imports: [PetsModule, AdoptionRequestsModule, DonationsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}