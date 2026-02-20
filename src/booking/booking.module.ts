import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Booking } from './booking.entity';
import { Doctor } from '../doctor/doctor.entity';
import { Patient } from '../patient/patient.entity';
import { Availability } from '../availability/availability.entity';

import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';

@Module({

  imports: [
    TypeOrmModule.forFeature([
      Booking,
      Doctor,
      Patient,
      Availability,
    ]),
  ],

  providers: [BookingService],

  controllers: [BookingController],

})
export class BookingModule {}
