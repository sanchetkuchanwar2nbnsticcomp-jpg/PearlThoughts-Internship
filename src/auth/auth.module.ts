import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from './user.entity';
import { Doctor } from '../doctor/doctor.entity';
import { Patient } from '../patient/patient.entity';

import { JwtStrategy } from './jwt.strategy';
import { MailService } from './mail.service';

@Module({
  imports: [
    ConfigModule, // ✅ Use env variables

    TypeOrmModule.forFeature([
      User,
      Doctor,
      Patient, // ✅ Added Patient entity
    ]),

    PassportModule,

    // ✅ Use async so secret comes from .env
    JwtModule.registerAsync({
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'), // ✅ FIXED
    signOptions: { expiresIn: '1d' },
  }),
}),

  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy,
    MailService,
  ],

  exports: [
    AuthService,
    JwtModule,
    PassportModule,
  ],
})
export class AuthModule {}
