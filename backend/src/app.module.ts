import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PetsModule } from './pets/pets.module';
import { AdoptionRequestsModule } from './adoption-requests/adoption-requests.module';
import { DonationsModule } from './donations/donations.module';

@Module({
  imports: [AuthModule, PetsModule, AdoptionRequestsModule, DonationsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
