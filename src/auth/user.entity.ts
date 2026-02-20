import { Doctor } from './../doctor/doctor.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

export enum UserRole {
  USER = 'USER',
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  // For normal login (email + password)
  @Column({ nullable: true })
  password: string;

  // For Google / OAuth login
  @Column({ nullable: true })
  picture: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

   @Column({ default: false })
isEmailVerified: boolean;

@Column({ nullable: true })
emailVerificationToken: string;

  // One user → one doctor profile (only if role = DOCTOR)
// One user → one doctor profile (only if role = DOCTOR)
@OneToOne(() => Doctor, (doctor) => doctor.user)
doctor: Doctor;

}
