import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';

import { Doctor } from '../doctor/doctor.entity';
import {
  SchedulingType,
  AvailabilityType,
} from './availability.enum';

export enum Day {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday',
}

@Entity()
export class Availability {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: AvailabilityType,
    default: AvailabilityType.RECURRING,
  })
  availabilityType: AvailabilityType;

  @Column({
    type: 'enum',
    enum: Day,
    nullable: true,
  })
  day: Day;

  @Column({ type: 'date', nullable: true })
  date: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({
    type: 'enum',
    enum: SchedulingType,
    default: SchedulingType.WAVE,
  })
  schedulingType: SchedulingType;

  // For WAVE
  @Column({ nullable: true })
  slotDuration: number;

  @Column({ nullable: true })
  maxPatientsPerSlot: number;

  // For STREAM
  @Column({ nullable: true })
  consultationDuration: number;

  @ManyToOne(() => Doctor, (doctor) => doctor.availabilities, {
    onDelete: 'CASCADE',
  })
  doctor: Doctor;
}
