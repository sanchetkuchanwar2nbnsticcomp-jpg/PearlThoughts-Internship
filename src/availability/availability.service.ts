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
import {
  SchedulingType,
  AvailabilityType,
} from './availability.enum';

@Injectable()
export class AvailabilityService {
 

  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,

    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  private generateSlots(avail: Availability): Slot[] {

    let interval = 0;
    let capacity = 1;

    if (avail.schedulingType === SchedulingType.WAVE) {
      interval = avail.slotDuration;
      capacity = avail.maxPatientsPerSlot;
    }

    if (avail.schedulingType === SchedulingType.STREAM) {
      interval = avail.consultationDuration;
      capacity = 1;
    }

    const slots: Slot[] = [];

    let start = this.timeToMinutes(avail.startTime);
    const end = this.timeToMinutes(avail.endTime);

    while (start + interval <= end) {

      slots.push({
        startTime: this.minutesToTime(start),
        endTime: this.minutesToTime(start + interval),
        maxPatients: capacity,
      });

      start += interval;
    }

    return slots;
  }

  async addAvailability(userId: number, dto: CreateAvailabilityDto) {

    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!doctor)
      throw new NotFoundException('Doctor not found');

    const start = this.timeToMinutes(dto.startTime);
    const end = this.timeToMinutes(dto.endTime);

    if (start >= end)
      throw new BadRequestException('End time must be greater than start time');

    if (dto.availabilityType === AvailabilityType.RECURRING && !dto.day)
      throw new BadRequestException('Day required for recurring');

    if (dto.availabilityType === AvailabilityType.CUSTOM && !dto.date)
      throw new BadRequestException('Date required for custom');

    if (
      dto.schedulingType === SchedulingType.WAVE &&
      (!dto.slotDuration || !dto.maxPatientsPerSlot)
    )
      throw new BadRequestException('slotDuration & maxPatientsPerSlot required for WAVE');

    if (
      dto.schedulingType === SchedulingType.STREAM &&
      !dto.consultationDuration
    )
      throw new BadRequestException('consultationDuration required for STREAM');


    // 🔥 OVERLAP CHECK STARTS HERE 🔥

    let existingAvailabilities: Availability[] = [];

    if (dto.availabilityType === AvailabilityType.RECURRING) {

      existingAvailabilities = await this.availabilityRepository.find({
        where: {
          doctor: { id: doctor.id },
          day: dto.day,
          availabilityType: AvailabilityType.RECURRING,
        },
      });
    }

    if (dto.availabilityType === AvailabilityType.CUSTOM) {

      existingAvailabilities = await this.availabilityRepository.find({
        where: {
          doctor: { id: doctor.id },
          date: dto.date,
          availabilityType: AvailabilityType.CUSTOM,
        },
      });
    }

    for (const existing of existingAvailabilities) {

      const existingStart = this.timeToMinutes(existing.startTime);
      const existingEnd = this.timeToMinutes(existing.endTime);

      const isOverlap =
        start < existingEnd &&
        end > existingStart;

      if (isOverlap) {

        throw new BadRequestException(
          'Availability overlaps with existing schedule'
        );
      }
    }

    // 🔥 OVERLAP CHECK ENDS HERE 🔥


    const availability = this.availabilityRepository.create({
      ...dto,
      doctor,
    });

    return await this.availabilityRepository.save(availability);
  }

  async getDoctorAvailability(userId: number) {

    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!doctor)
      throw new NotFoundException('Doctor not found');

    return await this.availabilityRepository.find({
      where: { doctor: { id: doctor.id } },
    });
  }

  async getDoctorSlotsByUserId(
    userId: number,
    day: string,
  ): Promise<AvailabilitySlotsResponse[]> {

    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!doctor)
      throw new NotFoundException('Doctor not found');

    return this.getSlotsForDoctor(doctor.id, day);
  }

  async getDoctorSlotsByDoctorId(
    doctorId: number,
    day: string,
  ): Promise<AvailabilitySlotsResponse[]> {

    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
    });

    if (!doctor)
      throw new NotFoundException('Doctor not found');

    return this.getSlotsForDoctor(doctor.id, day);
  }

  private async getSlotsForDoctor(
  doctorId: number,
  day: string,
): Promise<AvailabilitySlotsResponse[]> {

  const today = new Date().toISOString().split('T')[0];

  const availability = await this.availabilityRepository.find({
    where: [
      {
        doctor: { id: doctorId },
        availabilityType: AvailabilityType.RECURRING,
        day: day as Day,
      },
      {
        doctor: { id: doctorId },
        availabilityType: AvailabilityType.CUSTOM,
        date: today,
      },
    ],
  });

  const result: AvailabilitySlotsResponse[] = [];

  for (const avail of availability) {

    const slots = this.generateSlots(avail);

    result.push({
      availabilityId: avail.id,
      day: avail.day,
      date: avail.date,
      slots,
    });
  }

  return result;
}

async getDoctorSlotsByDay(
  doctorId: number,
  day: string,
) {

  const availability = await this.availabilityRepository.find({
    where: {
      doctor: { id: doctorId },
      availabilityType: AvailabilityType.RECURRING,
      day: day as Day,
    },
  });

  return availability.map(avail => ({
    availabilityId: avail.id,
    day: avail.day,
    slots: this.generateSlots(avail),
  }));
}

async getDoctorSlotsByDate(
  doctorId: number,
  date: string,
) {

  const availability = await this.availabilityRepository.find({
    where: {
      doctor: { id: doctorId },
      availabilityType: AvailabilityType.CUSTOM,
      date: date,
    },
  });

  return availability.map(avail => ({
    availabilityId: avail.id,
    date: avail.date,
    slots: this.generateSlots(avail),
  }));
}
async getAllAvailabilityCombined(
  doctorId: number,
) {

  const availability = await this.availabilityRepository.find({
    where: {
      doctor: { id: doctorId },
    },
  });

  const weeklyAvailability = availability
    .filter(a => a.day !== null)
    .map(a => ({
      availabilityId: a.id,
      day: a.day,
      slots: this.generateSlots(a),
    }));

  const customDateAvailability = availability
    .filter(a => a.date !== null)
    .map(a => ({
      availabilityId: a.id,
      date: a.date,
      slots: this.generateSlots(a),
    }));

  return {
    weeklyAvailability,
    customDateAvailability,
  };
}

async getDoctorSlotsByDateForUser(
  userId: number,
  date: string,
): Promise<AvailabilitySlotsResponse[]> {

  const doctor = await this.doctorRepository.findOne({
    where: { user: { id: userId } },
  });

  if (!doctor)
    throw new NotFoundException('Doctor not found');

  return this.getDoctorSlotsByDate(
    doctor.id,
    date,
  );
}



  async deleteAvailability(id: number, userId: number) {

    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!doctor)
      throw new NotFoundException('Doctor not found');

    const availability = await this.availabilityRepository.findOne({
      where: { id, doctor: { id: doctor.id } },
    });

    if (!availability)
      throw new NotFoundException('Availability not found');

    await this.availabilityRepository.remove(availability);

    return { message: 'Availability deleted successfully' };
  }
}


