import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Doctor } from '../doctor/doctor.entity';

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
    enum: Day,
  })
  day: Day;

  @Column()
  startTime: string; // "10:00"

  @Column()
  endTime: string; // "13:00"

  @ManyToOne(() => Doctor, (doctor) => doctor.availabilities, {
    onDelete: 'CASCADE',
  })
  doctor: Doctor;
}
