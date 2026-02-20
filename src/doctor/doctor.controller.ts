import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';

import { DoctorService } from './doctor.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { UserRole } from '../auth/user.entity';


@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
 @Roles(UserRole.DOCTOR)
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  // =========================
  // 🔓 PUBLIC: List doctors
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
  // 🔒 DOCTOR ONLY (example)
  // =========================
  @Get('me/profile')
  
  getMyProfile() {
    return {
      message: 'Doctor authenticated successfully',

      
    };
  }
}
