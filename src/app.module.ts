import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { DoctorModule } from './doctor/doctor.module';
import { AvailabilityModule } from './availability/availability.module';
import { ConfigModule } from '@nestjs/config';

import { PatientModule } from './patient/patient.module';
import { BookingModule } from './booking/booking.module';


@Module({
  imports: [

      // 🔥 LOAD ENV FIRST
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '@#sanchet',
      database: 'hello_nest_db',

      autoLoadEntities: true,
      synchronize: true, // ⚠️ dev only
      logging: true,
    }),

    AuthModule,
    DoctorModule,
    AvailabilityModule,
    PatientModule,
    BookingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
