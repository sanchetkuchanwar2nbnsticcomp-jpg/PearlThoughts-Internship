import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './user.entity';
import { Doctor } from '../doctor/doctor.entity';
import { JwtStrategy } from './jwt.strategy';

import { MailService } from './mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Doctor]),

    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.register({
      secret: 'SECRET', // 🔴 SAME everywhere
      signOptions: { expiresIn: '1d' },
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    MailService,
    JwtStrategy,
  ],

  exports: [
    AuthService,        // ✅ ADD THIS
    JwtModule,
    PassportModule,
    TypeOrmModule,
  ],
})
export class AuthModule {}
