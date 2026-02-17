import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  BadRequestException,
  ParseIntPipe,
  Query,
  UseGuards,
  Req,
  Delete,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { UserRole } from './user.entity';

import { DoctorSignupDto } from './dto/doctor-signup.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto'; 

import { PatientSignupDto } from '../patient/dto/patient-signup.dto';
import { UpdatePatientDto } from '../patient/dto/update-patient.dto.ts';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ======================
  // HEALTH CHECK
  // ======================
  @Get()
  testAuth() {
    return {
      status: true,
      message: 'Auth server running',
    };
  }

  // ======================
  // USER LOGIN
  // ======================
  @Post('login')
  async userLogin(@Body('token') token: string) {
    if (!token)
      throw new BadRequestException('Google token required');

    return this.authService.googleLogin(
      token,
      UserRole.USER,
    );
  }

  // ======================
  // USER SIGNUP
  // ======================
  @Post('signup')
  async userSignup(
    @Body('email') email: string,
    @Body('name') name: string,
    @Body('password') password: string,
    @Body('role') role: UserRole,
  ) {
    if (!email || !name || !password || !role)
      throw new BadRequestException(
        'Email, name, password and role required',
      );

    return this.authService.userSignup({
      email,
      name,
      password,
      role,
    });
  }

  // ======================
  // DOCTOR LOGIN
  // ======================
  @Post('doctor/login')
  async doctorLogin(@Body('token') token: string) {
    if (!token)
      throw new BadRequestException('Google token required');

    return this.authService.googleLogin(
      token,
      UserRole.DOCTOR,
    );
  }

  // ======================
  // DOCTOR SIGNUP
  // ======================
  @Post('doctor/signup')
  async doctorSignup(
    @Body('token') token: string,
    @Body() dto: DoctorSignupDto,
  ) {
    if (!token)
      throw new BadRequestException('Google token required');

    return this.authService.doctorSignup(token, dto);
  }

  // ======================
  // UPDATE DOCTOR PROFILE
  // ======================
  @UseGuards(JwtAuthGuard)
  @Put('doctor/update')
  updateDoctor(
    @Req() req,
    @Body() dto: UpdateDoctorDto,
  ) {
    return this.authService.updateDoctorProfile(
      req.user.id,
      dto,
    );
  }

  // ======================
  // DELETE DOCTOR PROFILE
  // ======================
  @UseGuards(JwtAuthGuard)
  @Delete('doctor/delete')
  deleteDoctor(@Req() req) {
    return this.authService.deleteDoctorProfile(
      req.user.id,
    );
  }

  // ======================
  // PATIENT LOGIN
  // ======================
  @Post('patient/login')
  async patientLogin(@Body('token') token: string) {
    if (!token)
      throw new BadRequestException('Google token required');

    return this.authService.googleLogin(
      token,
      UserRole.PATIENT,
    );
  }

  // ======================
  // PATIENT SIGNUP
  // ======================
  @Post('patient/signup')
  async patientSignup(@Body() dto: PatientSignupDto) {
    if (!dto.token)
      throw new BadRequestException('Google token required');

    return this.authService.patientSignup(
      dto.token,
      dto,
    );
  }

  // ======================
  // UPDATE PATIENT PROFILE
  // ======================
  @UseGuards(JwtAuthGuard)
  @Put('patient/update')
  updatePatient(
    @Req() req,
    @Body() dto: UpdatePatientDto,
  ) {
    return this.authService.updatePatientProfile(
      req.user.id,
      dto,
    );
  }

  // ======================
  // DELETE PATIENT PROFILE
  // ======================
  @UseGuards(JwtAuthGuard)
  @Delete('patient/delete')
  deletePatient(@Req() req) {
    return this.authService.deletePatientProfile(
      req.user.id,
    );
  }

  // ======================
  // VERIFY EMAIL
  // ======================
  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    if (!token)
      throw new BadRequestException(
        'Verification token required',
      );

    return this.authService.verifyEmail(token);
  }

  // ======================
  // GET ALL USERS
  // ======================
  @Get('users')
  getUsers() {
    return this.authService.getAllUsers();
  }

  // ======================
  // GET USER BY ID
  // ======================
  @Get('users/:id')
  getUser(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.authService.getUserById(id);
  }
}
