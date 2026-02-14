import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { PatientService } from './patient.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { UserRole } from '../auth/user.entity';

@Controller('patients')
export class PatientController {
  constructor(private patientService: PatientService) {}

  // ✅ Get all patients (optional, for admin/testing)
  @Get()
  getPatients() {
    return this.patientService.findAll();
  }

  // ✅ Get logged-in patient's profile
  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PATIENT)
  async getMyProfile(@Req() req: any) {
    const userId = req.user.id; // Extract userId from JWT
    const profile = await this.patientService.findByUserId(userId);

    return {
      message: 'Patient authenticated successfully',
      profile,
    };
  }
}
