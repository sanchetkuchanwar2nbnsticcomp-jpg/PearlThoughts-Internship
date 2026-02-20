import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';

import { Doctor } from '../doctor/doctor.entity';
import { Patient } from '../patient/patient.entity';

@Entity()
export class Booking {

  @PrimaryGeneratedColumn()
  id: number;


  @ManyToOne(() => Doctor, { eager: true })
  doctor: Doctor;


  @ManyToOne(() => Patient, { eager: true })
  patient: Patient;


  @Column({ type: 'date' })
  date: string; // 2026-02-17


  @Column({ type: 'time' })
  startTime: string; // 09:00


  @Column({ type: 'time' })
  endTime: string; // 09:30

}
