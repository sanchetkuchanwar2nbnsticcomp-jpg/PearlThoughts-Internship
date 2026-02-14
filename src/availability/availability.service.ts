import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Availability } from './availability.entity';
import { Doctor } from '../doctor/doctor.entity';
import { CreateAvailabilityDto } from './availability.dto';
import { Slot, AvailabilitySlotsResponse } from './availability.types';
import { Day } from './availability.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,

    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  // Convert time string "HH:MM" to minutes
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Convert minutes to time string "HH:MM"
  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60)
      .toString()
      .padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  // Generate slots for a day (recurring weekly)
  private generateSlots(
    startTime: string,
    endTime: string,
    slotDuration: number,
    maxPatientsPerSlot: number,
  ): Slot[] {
    const slots: Slot[] = [];
    let start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    while (start + slotDuration <= end) {
      const slotStart = start;
      const slotEnd = start + slotDuration;
      slots.push({
        startTime: this.minutesToTime(slotStart),
        endTime: this.minutesToTime(slotEnd),
        maxPatients: maxPatientsPerSlot,
      });
      start += slotDuration;
    }

    return slots;
  }

  /**
   * Add availability for a doctor
   * - Recurring weekly: persists every week until deleted
   * - Prevents duplicate availability for the same day
   */
  async addAvailability(userId: number, dto: CreateAvailabilityDto) {
    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!doctor) throw new NotFoundException('Doctor not found');

    const start = this.timeToMinutes(dto.startTime);
    const end = this.timeToMinutes(dto.endTime);
    if (start >= end) throw new BadRequestException('End time must be greater than start time');

    // Prevent duplicate availability for the same doctor/day
    const existing = await this.availabilityRepository.findOne({
      where: { doctor: { id: doctor.id }, day: dto.day },
    });

    if (existing) {
      throw new BadRequestException(`Availability for ${dto.day} already exists.`);
    }

    const availability = this.availabilityRepository.create({
      ...dto,
      day: dto.day as Day,
      doctor,
    });

    return await this.availabilityRepository.save(availability);
  }

  /**
   * Get all availability for a doctor
   * - Each entry represents recurring weekly availability
   */
  async getDoctorAvailability(userId: number) {
    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!doctor) throw new NotFoundException('Doctor not found');

    return await this.availabilityRepository.find({
      where: { doctor: { id: doctor.id } },
      order: { day: 'ASC', startTime: 'ASC' },
    });
  }

  /**
   * Get generated slots for a specific day
   * - Returns slots for recurring weekly availability
   * - Patients will see this schedule every week
   */
  async getDoctorSlots(
    userId: number,
    day: string,
  ): Promise<AvailabilitySlotsResponse[]> {
    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!doctor) throw new NotFoundException('Doctor not found');

    const availability = await this.availabilityRepository.find({
      where: { doctor: { id: doctor.id }, day: day as Day },
    });

    const result: AvailabilitySlotsResponse[] = [];

    for (const avail of availability) {
      const slots = this.generateSlots(
        avail.startTime,
        avail.endTime,
        avail.slotDuration,
        avail.maxPatientsPerSlot,
      );

      result.push({
        availabilityId: avail.id,
        day: avail.day,
        slots,
      });
    }

    return result;
  }

  /**
   * Delete availability
   * - Removes the recurring availability for the specified day
   */
  async deleteAvailability(id: number, userId: number) {
    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!doctor) throw new NotFoundException('Doctor not found');

    const availability = await this.availabilityRepository.findOne({
      where: { id, doctor: { id: doctor.id } },
    });

    if (!availability) throw new NotFoundException('Availability not found');

    await this.availabilityRepository.remove(availability);

    return { message: 'Availability deleted successfully' };
  }
}
