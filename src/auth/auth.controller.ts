import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRole } from './user.entity';
import { DoctorSignupDto } from './dto/doctor-signup.dto';
import { PatientSignupDto } from '../patient/dto/patient-signup.dto';

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
        userSignup: 'POST /auth/signup',
        doctorLogin: 'POST /auth/doctor/login',
        doctorSignup: 'POST /auth/doctor/signup',
        patientLogin: 'POST /auth/patient/login',
        patientSignup: 'POST /auth/patient/signup',
        verifyEmail: 'GET /auth/verify-email/:token',
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
    if (!token) throw new BadRequestException('Google token is required');
    return this.authService.googleLogin(token, UserRole.USER);
  }

  // ======================
  // 📝 USER SIGNUP
  // ======================
  @Post('signup')
  async userSignup(
    @Body('email') email: string,
    @Body('name') name: string,
    @Body('password') password: string,
    @Body('role') role: UserRole,
  ) {
    if (!email || !name || !password || !role) {
      throw new BadRequestException('Email, name, password, and role are required');
    }
    return this.authService.userSignup({ email, name, password, role });
  }

  // ======================
  // 🔐 DOCTOR LOGIN
  // ======================
  @Post('doctor/login')
  async doctorLogin(@Body('token') token: string) {
    if (!token) throw new BadRequestException('Google token is required');
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
    if (!token) throw new BadRequestException('Google token is required');
    return this.authService.doctorSignup(token, dto);
  }

  // ======================
  // 🔐 PATIENT LOGIN
  // ======================
  @Post('patient/login')
  async patientLogin(@Body('token') token: string) {
    if (!token) throw new BadRequestException('Google token is required');
    return this.authService.googleLogin(token, UserRole.PATIENT);
  }

  // ======================
  // 🧑 PATIENT SIGNUP
  // ======================
  @Post('patient/signup')
  async patientSignup(
    @Body('token') token: string,
    @Body() dto: PatientSignupDto,
  ) {
    if (!token) throw new BadRequestException('Google token is required');
    return this.authService.patientSignup(token, dto);
  }

  // ======================
  // ✅ EMAIL VERIFICATION
  // ======================
@Get('verify-email')
async verifyEmail(@Query('token') token: string) {
  if (!token) throw new BadRequestException('Verification token is required');
  return this.authService.verifyEmail(token);
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

