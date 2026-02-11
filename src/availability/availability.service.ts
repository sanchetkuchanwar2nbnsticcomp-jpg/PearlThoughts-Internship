import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './availability.entity';
import { Doctor } from '../doctor/doctor.entity';
import { CreateAvailabilityDto } from './availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,

    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  // ✅ Add availability
  async addAvailability(userId: number, dto: CreateAvailabilityDto) {
    // 🔥 FIX: Find doctor using user.id
    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const availability = this.availabilityRepository.create({
      ...dto,
      doctor,
    });

    return this.availabilityRepository.save(availability);
  }

  // ✅ Get my availability
  async getDoctorAvailability(userId: number) {
    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return this.availabilityRepository.find({
      where: { doctor: { id: doctor.id } },
    });
  }

  // ✅ Delete availability
  async deleteAvailability(id: number, userId: number) {
    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const availability = await this.availabilityRepository.findOne({
      where: {
        id,
        doctor: { id: doctor.id },
      },
      relations: ['doctor'],
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    await this.availabilityRepository.remove(availability);

    return { message: 'Availability deleted successfully' };
  }
}
