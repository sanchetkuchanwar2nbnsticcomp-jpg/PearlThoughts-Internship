import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  BadRequestException,
  HttpException,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { UserRole } from './user.entity';
import { DoctorSignupDto } from './dto/doctor-signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ======================
  // ✅ Health check
  // ======================
  @Get()
  testAuth() {
    return {
      status: true,
      message: 'Auth server is running',
      endpoints: {
        userLogin: 'POST /auth/login',
        doctorLogin: 'POST /auth/doctor/login',
        doctorSignup: 'POST /auth/doctor/signup',
        getUsers: 'GET /auth/users',
        getUserById: 'GET /auth/users/:id',
      },
    };
  }

  // ======================
  // 🔐 USER LOGIN
  // ======================
  @Post('login')
  async userLogin(@Body('token') token: string) {
    if (!token) {
      throw new BadRequestException('Google token is required');
    }

    return this.authService.googleLogin(token, UserRole.USER);
  }

  // ======================
  // 🔐 DOCTOR LOGIN
  // ======================
  @Post('doctor/login')
  async doctorLogin(@Body('token') token: string) {
    if (!token) {
      throw new BadRequestException('Google token is required');
    }

    return this.authService.googleLogin(token, UserRole.DOCTOR);
  }

  // ======================
  // 📝 DOCTOR SIGNUP
  // ======================
  @Post('doctor/signup')
  async doctorSignup(
    @Body('token') token: string,
    @Body() dto: DoctorSignupDto,
  ) {
    if (!token) {
      throw new BadRequestException('Google token is required');
    }

    return this.authService.doctorSignup(token, dto);
  }

  // ======================
  // 👤 GET ALL USERS
  // ======================
  @Get('users')
  async getUsers() {
    return this.authService.getAllUsers();
  }

  // ======================
  // 👤 GET USER BY ID
  // ======================
  @Get('users/:id')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    return this.authService.getUserById(id);
  }
}
