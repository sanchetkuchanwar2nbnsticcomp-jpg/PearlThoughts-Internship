import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Availability, Day } from './availability.entity';
import { Doctor } from '../doctor/doctor.entity';

import { CreateAvailabilityDto } from './availability.dto';
import { Slot, AvailabilitySlotsResponse } from './availability.types';

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

  // ---------------- TIME HELPERS ----------------

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  // ---------------- SLOT GENERATOR ----------------

  private generateSlots(avail: Availability): Slot[] {

    // ✅ STREAM → ONE BIG SLOT
    if (avail.schedulingType === SchedulingType.STREAM) {
      return [
        {
          startTime: avail.startTime,
          endTime: avail.endTime,
          maxPatients: avail.maxPatientsPerSlot,
        },
      ];
    }

    // ✅ WAVE → SUB SLOTS
    const slots: Slot[] = [];

    let start = this.timeToMinutes(avail.startTime);
    const end = this.timeToMinutes(avail.endTime);

    while (start + avail.slotDuration <= end) {

      slots.push({
        startTime: this.minutesToTime(start),
        endTime: this.minutesToTime(start + avail.slotDuration),
        maxPatients: avail.maxPatientsPerSlot,
      });

      start += avail.slotDuration;
    }

    return slots;
  }

  // ---------------- GET DOCTOR ----------------

  private async getDoctorByUserId(userId: number): Promise<Doctor> {

    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!doctor)
      throw new NotFoundException('Doctor not found');

    return doctor;
  }

  // ---------------- ADD AVAILABILITY ----------------

  async addAvailability(userId: number, dto: CreateAvailabilityDto) {

    const doctor = await this.getDoctorByUserId(userId);

    const start = this.timeToMinutes(dto.startTime);
    const end = this.timeToMinutes(dto.endTime);

    if (start >= end)
      throw new BadRequestException('Invalid time range');

    if (dto.availabilityType === AvailabilityType.RECURRING && !dto.day)
      throw new BadRequestException('Day required');

    if (dto.availabilityType === AvailabilityType.CUSTOM && !dto.date)
      throw new BadRequestException('Date required');

    // prevent duplicate recurring
    if (dto.availabilityType === AvailabilityType.RECURRING) {

      const exists = await this.availabilityRepository.findOne({
        where: {
          doctor: { id: doctor.id },
          availabilityType: AvailabilityType.RECURRING,
          day: dto.day,
        },
      });

      if (exists)
        throw new BadRequestException(
          'Recurring availability already exists for this day',
        );
    }

    // prevent duplicate custom
    if (dto.availabilityType === AvailabilityType.CUSTOM) {

      const exists = await this.availabilityRepository.findOne({
        where: {
          doctor: { id: doctor.id },
          availabilityType: AvailabilityType.CUSTOM,
          date: dto.date,
        },
      });

      if (exists)
        throw new BadRequestException(
          'Custom availability already exists for this date',
        );
    }

    const availability =
      this.availabilityRepository.create({
        ...dto,
        doctor,
      });

    return await this.availabilityRepository.save(availability);
  }

  // ---------------- UPDATE ----------------

  async updateAvailability(
    id: number,
    userId: number,
    dto: CreateAvailabilityDto,
  ) {

    const doctor = await this.getDoctorByUserId(userId);

    const availability =
      await this.availabilityRepository.findOne({
        where: { id, doctor: { id: doctor.id } },
      });

    if (!availability)
      throw new NotFoundException('Availability not found');

    Object.assign(availability, dto);

    return await this.availabilityRepository.save(availability);
  }

  // ---------------- DELETE ----------------

  async deleteAvailability(id: number, userId: number) {

    const doctor = await this.getDoctorByUserId(userId);

    const availability =
      await this.availabilityRepository.findOne({
        where: { id, doctor: { id: doctor.id } },
      });

    if (!availability)
      throw new NotFoundException('Availability not found');

    await this.availabilityRepository.remove(availability);

    return { message: 'Deleted successfully' };
  }

  // ---------------- FIX: USER → DOCTOR → DAY ----------------

  async getDoctorSlotsByUserId(
    userId: number,
    day: string,
  ): Promise<AvailabilitySlotsResponse[]> {

    const doctor = await this.getDoctorByUserId(userId);

    return this.getDoctorSlotsByDoctorId(
      doctor.id,
      day,
    );
  }

  // ---------------- GET BY DOCTOR ID + DAY ----------------

  async getDoctorSlotsByDoctorId(
    doctorId: number,
    day: string,
  ): Promise<AvailabilitySlotsResponse[]> {

    const availabilities =
      await this.availabilityRepository.find({
        where: {
          doctor: { id: doctorId },
          availabilityType: AvailabilityType.RECURRING,
          day: day as Day,
        },
      });

    return availabilities.map(avail => ({
      availabilityId: avail.id,
      day: avail.day,
      slots: this.generateSlots(avail),
    }));
  }

  // ---------------- CUSTOM OVERRIDE ----------------

  async getDoctorSlotsByDate(
    doctorId: number,
    date: string,
  ): Promise<AvailabilitySlotsResponse[]> {

    const custom =
      await this.availabilityRepository.find({
        where: {
          doctor: { id: doctorId },
          availabilityType: AvailabilityType.CUSTOM,
          date,
        },
      });

    // CUSTOM overrides recurring
    if (custom.length > 0) {

      return custom.map(avail => ({
        availabilityId: avail.id,
        date: avail.date,
        slots: this.generateSlots(avail),
      }));
    }

    const dayName = new Date(date)
      .toLocaleDateString('en-US', { weekday: 'long' });

    return this.getDoctorSlotsByDoctorId(
      doctorId,
      dayName,
    );
  }

  async getDoctorSlotsByDateForUser(
    userId: number,
    date: string,
  ) {

    const doctor = await this.getDoctorByUserId(userId);

    return this.getDoctorSlotsByDate(
      doctor.id,
      date,
    );
  }

  // ---------------- GET ALL ----------------

  async getAllAvailabilityCombined(userId: number) {

    const doctor = await this.getDoctorByUserId(userId);

    const availability =
      await this.availabilityRepository.find({
        where: { doctor: { id: doctor.id } },
      });

    return {

      weeklyAvailability: availability
        .filter(a => a.availabilityType === AvailabilityType.RECURRING)
        .map(a => ({
          id: a.id,
          day: a.day,
          slots: this.generateSlots(a),
        })),

      customAvailability: availability
        .filter(a => a.availabilityType === AvailabilityType.CUSTOM)
        .map(a => ({
          id: a.id,
          date: a.date,
          slots: this.generateSlots(a),
        })),
    };
  }

}
