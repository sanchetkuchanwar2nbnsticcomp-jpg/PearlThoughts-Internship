import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Patient } from './patient.entity';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
  ) {}

  // ✅ Get all patients (for admin/testing)
  findAll() {
    return this.patientRepo.find({
      relations: ['user'],
    });
  }

  // ✅ Get patient by patient ID
  findById(id: number) {
    return this.patientRepo.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  // ✅ Get patient by user ID (for logged-in patient)
  async findByUserId(userId: number) {
    const patient = await this.patientRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }
}
