import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';

import { DoctorService } from './doctor.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { UserRole } from '../auth/user.entity';

@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DOCTOR) // Only doctors can access protected routes
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  // =========================
  // 🔓 PUBLIC: List all doctors
  // =========================
  @Get()
  getAllDoctors() {
    return this.doctorService.findAllDoctors();
  }

  // =========================
  // 🔓 PUBLIC: Get doctor by ID
  // =========================
  @Get(':id')
  getDoctor(@Param('id', ParseIntPipe) id: number) {
    return this.doctorService.findDoctorById(id);
  }

  // =========================
  // 🔒 DOCTOR ONLY: Get own profile
  // =========================
  @Get('me/profile')
  async getMyProfile(@Req() req: any) {
    const userId = req.user.id;
    const profile = await this.doctorService.findDoctorByUserId(userId);

    return {
      message: 'Doctor authenticated successfully',
      profile,
    };
  }
}
