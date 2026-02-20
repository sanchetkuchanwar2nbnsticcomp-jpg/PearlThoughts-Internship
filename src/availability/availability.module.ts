import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Availability } from './availability.entity';
import { Doctor } from '../doctor/doctor.entity';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Availability, Doctor])],
  providers: [AvailabilityService],
  controllers: [AvailabilityController],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
