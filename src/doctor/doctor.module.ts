import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { Doctor } from './doctor.entity';
import { User } from '../auth/user.entity';

import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor, User]),

    PassportModule.register({ defaultStrategy: 'jwt' }),

    AuthModule, // 🔑 gives JwtStrategy + JwtModule
  ],
  providers: [DoctorService],
  controllers: [DoctorController],
})
export class DoctorModule {}
