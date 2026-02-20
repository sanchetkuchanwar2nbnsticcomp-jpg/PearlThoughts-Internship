import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Booking } from './booking.entity';
import { Doctor } from '../doctor/doctor.entity';
import { Patient } from '../patient/patient.entity';
import { Availability } from '../availability/availability.entity';

@Injectable()
export class BookingService {

  constructor(

    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,

    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,

    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,

    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,

  ) {}



  // ================================
  // TIME HELPERS
  // ================================

  private timeToMinutes(time: string): number {

    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;

  }

  private minutesToTime(minutes: number): string {

    const h = Math.floor(minutes / 60)
      .toString()
      .padStart(2, '0');

    const m = (minutes % 60)
      .toString()
      .padStart(2, '0');

    return `${h}:${m}`;

  }



  private generateSlots(
    startTime: string,
    endTime: string,
    slotDuration: number,
    maxPatientsPerSlot: number,
  ): Array<{ startTime: string; endTime: string; maxPatients: number }> {

    const slots: Array<{ startTime: string; endTime: string; maxPatients: number }> = [];

    let start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    while (start + slotDuration <= end) {

      slots.push({
        startTime: this.minutesToTime(start),
        endTime: this.minutesToTime(start + slotDuration),
        maxPatients: maxPatientsPerSlot,
      });

      start += slotDuration;

    }

    return slots;

  }



  // ================================
  // CREATE BOOKING
  // ================================

  async createBooking(
    doctorId: number,
    patientId: number,
    date: string,
    startTime: string,
    endTime: string,
  ) {

    // ================================
    // CHECK DOCTOR EXISTS
    // ================================

    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
    });

    if (!doctor)
      throw new NotFoundException('Doctor not found');



    // ================================
    // CHECK PATIENT EXISTS
    // ================================

    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });

    if (!patient)
      throw new NotFoundException('Patient not found');



    // ================================
    // GET DAY FROM DATE
    // ================================

    const day = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
    });



    // ================================
    // GET DOCTOR AVAILABILITY
    // ================================

    const availabilities =
      await this.availabilityRepository.find({
        where: {
          doctor: { id: doctorId },
          day: day as any,
        },
      });

    if (availabilities.length === 0)
      throw new BadRequestException(
        'Doctor not available on this day',
      );



    // ================================
    // CHECK SLOT IS VALID
    // ================================

    let slotValid = false;
    let maxPatientsPerSlot = 0;

    for (const avail of availabilities) {

      const slots = this.generateSlots(
        avail.startTime,
        avail.endTime,
        avail.slotDuration,
        avail.maxPatientsPerSlot,
      );

      const found = slots.find(
        slot =>
          slot.startTime === startTime &&
          slot.endTime === endTime,
      );

      if (found) {

        slotValid = true;
        maxPatientsPerSlot = found.maxPatients;
        break;

      }

    }

    if (!slotValid)
      throw new BadRequestException(
        'Invalid slot',
      );



    // ================================
    // PREVENT SAME PATIENT DUPLICATE BOOKING
    // ================================

    const existingPatientBooking =
      await this.bookingRepository.findOne({
        where: {
          doctor: { id: doctorId },
          patient: { id: patientId },
          date,
          startTime,
        },
      });

    if (existingPatientBooking)
      throw new BadRequestException(
        'You already booked this slot',
      );



    // ================================
    // CHECK SLOT FULL
    // ================================

    const bookingCount =
      await this.bookingRepository.count({
        where: {
          doctor: { id: doctorId },
          date,
          startTime,
        },
      });

    if (bookingCount >= maxPatientsPerSlot)
      throw new BadRequestException(
        'Slot is full',
      );



    // ================================
    // CREATE BOOKING
    // ================================

    const booking =
      this.bookingRepository.create({
        doctor,
        patient,
        date,
        startTime,
        endTime,
      });

    return await this.bookingRepository.save(
      booking,
    );

  }



  // ================================
  // GET BOOKINGS FOR DOCTOR
  // ================================

  async getDoctorBookings(doctorId: number) {

    return await this.bookingRepository.find({
      where: {
        doctor: { id: doctorId },
      },
      order: {
        date: 'ASC',
        startTime: 'ASC',
      },
    });

  }



  // ================================
  // GET BOOKINGS FOR PATIENT
  // ================================

  async getPatientBookings(patientId: number) {

    return await this.bookingRepository.find({
      where: {
        patient: { id: patientId },
      },
      order: {
        date: 'ASC',
        startTime: 'ASC',
      },
    });

  }



  // ================================
  // CANCEL BOOKING
  // ================================

  async cancelBooking(bookingId: number) {

    const booking =
      await this.bookingRepository.findOne({
        where: { id: bookingId },
      });

    if (!booking)
      throw new NotFoundException(
        'Booking not found',
      );

    await this.bookingRepository.remove(
      booking,
    );

    return {
      message: 'Booking cancelled successfully',
    };

  }

}
