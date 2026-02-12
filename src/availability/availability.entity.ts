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

@Column({ type: 'time', default: '09:00:00' })
startTime: string;

@Column({ type: 'time', default: '17:00:00' })
endTime: string;


  // NEW FIELD
  @Column({default : 30})
  slotDuration: number; // in minutes

  // NEW FIELD
  @Column({default : 1})
  maxPatientsPerSlot: number;

  @ManyToOne(() => Doctor, (doctor) => doctor.availabilities, {
    onDelete: 'CASCADE',
  })
  doctor: Doctor;
}
