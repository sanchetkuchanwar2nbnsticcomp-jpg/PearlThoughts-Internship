import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Availability } from '../availability/availability.entity';
import { User } from '../auth/user.entity';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  specialization: string;

  @Column({ type: 'int' })
  experience: number;

  @Column()
  level: string;



  // 🔐 Auth connection
  @OneToOne(() => User, (user) => user.doctor)
@JoinColumn()
user: User;



  // 🕒 Availability slots
  @OneToMany(
    () => Availability,
    (availability) => availability.doctor,
    { cascade: true },
  )
  availabilities: Availability[];
}
