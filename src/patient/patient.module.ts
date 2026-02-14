import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Patient } from './patient.entity';
import { User } from '../auth/user.entity';

import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, User]),
  ],
  providers: [PatientService],
  controllers: [PatientController],
})
export class PatientModule {}
