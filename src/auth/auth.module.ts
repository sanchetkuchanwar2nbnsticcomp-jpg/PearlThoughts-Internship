import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  imports: [
    // Register User entity for database access
    TypeOrmModule.forFeature([User]),

    // Register JWT
    JwtModule.register({
      secret: "MY_SECRET_KEY",
      signOptions: { expiresIn: '1d' },
    }),
  ],

  controllers: [AuthController],

  providers: [AuthService],

  // export if needed in other modules
  exports: [JwtModule, TypeOrmModule],
})
export class AuthModule {}
