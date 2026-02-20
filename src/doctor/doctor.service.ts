import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}

  // Create Doctor
  async createDoctor(data: Partial<Doctor>) {
    if (!data.name) {
      throw new BadRequestException('Doctor name is required');
    }

    if (!data.specialization) {
      throw new BadRequestException('Doctor specialization is required');
    }

    if (data.experience === undefined || data.experience < 0) {
      throw new BadRequestException('Valid experience is required');
    }

    // derive level & fee from experience
    const level = this.getDoctorLevel(data.experience);
    const consultationFee = this.getConsultationFee(data.experience);

    const doctor = this.doctorRepo.create({
      name: data.name,
      specialization: data.specialization,
      experience: data.experience,
      level,
      user: data.user, // include user if provided
    });

    return this.doctorRepo.save(doctor);
  }

  // Get all doctors
  async findAllDoctors() {
    return this.doctorRepo.find({
      order: { experience: 'DESC' },
      relations: ['user'], // include user info
    });
  }

  // Get doctor by ID
  async findDoctorById(id: number) {
    const doctor = await this.doctorRepo.findOne({
      where: { id },
      relations: ['user'], // include user info
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    return doctor;
  }

  // ✅ NEW: Get doctor by user ID (for /me/profile)
  async findDoctorByUserId(userId: number) {
    const doctor = await this.doctorRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'], // include user details
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found for this user');
    }

    return doctor;
  }

  // ---------- Helpers ----------

  private getDoctorLevel(experience: number): string {
    if (experience < 3) return 'Junior';
    if (experience < 8) return 'Mid';
    return 'Senior';
  }

  private getConsultationFee(experience: number): number {
    if (experience < 3) return 300;
    if (experience < 8) return 500;
    return 800;
  }
}
